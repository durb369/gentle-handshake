import { ImagingMode } from "./ImagingModeSelector";

interface FilterSettings {
  reflectionIntensity: number;
  lightBleed: number;
  shadowDepth: number;
  thermalSensitivity: number;
  spectralBands: number;
  polarizationAngle: number;
  focusDistance: number; // 0 = background, 50 = glass plane (midpoint), 100 = foreground
  glassPanes: number;   // number of glass layers (1-3)
}

// Sobel edge detection for anomaly highlighting
function detectEdges(
  data: Uint8ClampedArray,
  width: number,
  height: number
): Float32Array {
  const edges = new Float32Array(width * height);
  
  for (let y = 1; y < height - 1; y++) {
    for (let x = 1; x < width - 1; x++) {
      const i = (y * width + x) * 4;
      
      // Get surrounding luminance values
      const getL = (ox: number, oy: number) => {
        const idx = ((y + oy) * width + (x + ox)) * 4;
        return (data[idx] * 0.299 + data[idx + 1] * 0.587 + data[idx + 2] * 0.114) / 255;
      };
      
      // Sobel operators
      const gx = -getL(-1, -1) - 2 * getL(-1, 0) - getL(-1, 1) +
                  getL(1, -1) + 2 * getL(1, 0) + getL(1, 1);
      const gy = -getL(-1, -1) - 2 * getL(0, -1) - getL(1, -1) +
                  getL(-1, 1) + 2 * getL(0, 1) + getL(1, 1);
      
      edges[y * width + x] = Math.sqrt(gx * gx + gy * gy);
    }
  }
  
  return edges;
}

// Detect anomalous regions (sudden changes in texture/pattern)
function detectAnomalies(
  data: Uint8ClampedArray,
  width: number,
  height: number,
  blockSize: number = 8
): Float32Array {
  const anomalies = new Float32Array(width * height);
  const blocksX = Math.floor(width / blockSize);
  const blocksY = Math.floor(height / blockSize);
  
  // Calculate variance for each block
  const blockVariances: number[] = [];
  for (let by = 0; by < blocksY; by++) {
    for (let bx = 0; bx < blocksX; bx++) {
      let sum = 0, sumSq = 0, count = 0;
      
      for (let y = by * blockSize; y < (by + 1) * blockSize && y < height; y++) {
        for (let x = bx * blockSize; x < (bx + 1) * blockSize && x < width; x++) {
          const i = (y * width + x) * 4;
          const lum = (data[i] + data[i + 1] + data[i + 2]) / 3;
          sum += lum;
          sumSq += lum * lum;
          count++;
        }
      }
      
      const mean = sum / count;
      const variance = (sumSq / count) - (mean * mean);
      blockVariances.push(variance);
    }
  }
  
  // Calculate global mean variance
  const meanVariance = blockVariances.reduce((a, b) => a + b, 0) / blockVariances.length;
  const stdVariance = Math.sqrt(
    blockVariances.reduce((a, b) => a + (b - meanVariance) ** 2, 0) / blockVariances.length
  );
  
  // Mark blocks that deviate significantly as anomalous
  let blockIdx = 0;
  for (let by = 0; by < blocksY; by++) {
    for (let bx = 0; bx < blocksX; bx++) {
      const deviation = Math.abs(blockVariances[blockIdx] - meanVariance) / (stdVariance + 0.001);
      const anomalyScore = Math.min(1, deviation / 2);
      
      for (let y = by * blockSize; y < (by + 1) * blockSize && y < height; y++) {
        for (let x = bx * blockSize; x < (bx + 1) * blockSize && x < width; x++) {
          anomalies[y * width + x] = anomalyScore;
        }
      }
      blockIdx++;
    }
  }
  
  return anomalies;
}

// Detect fog/smoke/mist disturbances: low local contrast + medium luminance + soft edges
function detectDisturbances(
  data: Uint8ClampedArray,
  width: number,
  height: number,
  blockSize: number = 12
): Float32Array {
  const disturbances = new Float32Array(width * height);
  const blocksX = Math.floor(width / blockSize);
  const blocksY = Math.floor(height / blockSize);

  // Per-block: compute mean luminance, variance (contrast), and color saturation
  const blockScores: number[] = [];
  for (let by = 0; by < blocksY; by++) {
    for (let bx = 0; bx < blocksX; bx++) {
      let sumL = 0, sumL2 = 0, sumSat = 0, count = 0;
      for (let y = by * blockSize; y < (by + 1) * blockSize && y < height; y++) {
        for (let x = bx * blockSize; x < (bx + 1) * blockSize && x < width; x++) {
          const i = (y * width + x) * 4;
          const r = data[i], g = data[i + 1], b = data[i + 2];
          const lum = (r * 0.299 + g * 0.587 + b * 0.114);
          const maxC = Math.max(r, g, b), minC = Math.min(r, g, b);
          const sat = maxC > 0 ? (maxC - minC) / maxC : 0;
          sumL += lum;
          sumL2 += lum * lum;
          sumSat += sat;
          count++;
        }
      }
      const meanL = sumL / count;
      const variance = (sumL2 / count) - (meanL * meanL);
      const meanSat = sumSat / count;

      // Fog/smoke/mist characteristics:
      // - Low variance (low local contrast = hazy)
      // - Medium luminance (not pure black, not pure white)
      // - Low saturation (desaturated/washed out)
      const lowContrast = Math.max(0, 1 - variance / 1200); // high when flat
      const midLum = 1 - Math.abs(meanL / 255 - 0.5) * 2; // peaks at mid-brightness
      const lowSat = Math.max(0, 1 - meanSat * 3); // high when desaturated
      
      // Composite disturbance score
      const score = lowContrast * 0.5 + midLum * 0.25 + lowSat * 0.25;
      blockScores.push(Math.min(1, Math.max(0, score)));
    }
  }

  // Write block scores into pixel map with smooth edges
  let blockIdx = 0;
  for (let by = 0; by < blocksY; by++) {
    for (let bx = 0; bx < blocksX; bx++) {
      const score = blockScores[blockIdx];
      for (let y = by * blockSize; y < (by + 1) * blockSize && y < height; y++) {
        for (let x = bx * blockSize; x < (bx + 1) * blockSize && x < width; x++) {
          disturbances[y * width + x] = score;
        }
      }
      blockIdx++;
    }
  }

  // Simple blur pass for smoother transitions
  const blurred = new Float32Array(disturbances.length);
  const r = 6;
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      let sum = 0, cnt = 0;
      for (let dy = -r; dy <= r; dy += 3) {
        for (let dx = -r; dx <= r; dx += 3) {
          const nx = Math.min(width - 1, Math.max(0, x + dx));
          const ny = Math.min(height - 1, Math.max(0, y + dy));
          sum += disturbances[ny * width + nx];
          cnt++;
        }
      }
      blurred[y * width + x] = sum / cnt;
    }
  }

  return blurred;
}

// Apply thermal infrared with energy field detection + disturbance highlighting
function applyThermalFilter(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  sensitivity: number
) {
  const imageData = ctx.getImageData(0, 0, width, height);
  const data = imageData.data;
  const sensitivityFactor = sensitivity / 100;
  
  // Detect edges for energy field boundaries
  const edges = detectEdges(data, width, height);
  const anomalies = detectAnomalies(data, width, height);
  const disturbances = detectDisturbances(data, width, height);

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const i = (y * width + x) * 4;
      const edgeIdx = y * width + x;
      
      // Calculate luminance as "temperature"
      const luminance = (data[i] * 0.299 + data[i + 1] * 0.587 + data[i + 2] * 0.114) / 255;
      
      const disturbance = disturbances[edgeIdx];
      
      // Apply sensitivity curve with edge + disturbance enhancement
      const edgeBoost = edges[edgeIdx] * sensitivityFactor * 2;
      const anomalyBoost = anomalies[edgeIdx] * sensitivityFactor;
      // Disturbances push temperature reading UP to make them glow hot
      const disturbanceBoost = disturbance * sensitivityFactor * 0.5;
      let temp = Math.pow(luminance, 1 - sensitivityFactor * 0.6) + edgeBoost * 0.3 + anomalyBoost * 0.2 + disturbanceBoost;
      temp = Math.min(1, Math.max(0, temp));
      
      // Enhanced thermal palette
      let r: number, g: number, b: number;
      
      if (temp < 0.15) {
        const t = temp / 0.15;
        r = Math.floor(20 + t * 30);
        g = 0;
        b = Math.floor(40 + t * 80);
      } else if (temp < 0.3) {
        const t = (temp - 0.15) / 0.15;
        r = Math.floor(50 - t * 50);
        g = 0;
        b = Math.floor(120 + t * 135);
      } else if (temp < 0.45) {
        const t = (temp - 0.3) / 0.15;
        r = 0;
        g = Math.floor(t * 200);
        b = 255;
      } else if (temp < 0.55) {
        const t = (temp - 0.45) / 0.1;
        r = 0;
        g = Math.floor(200 + t * 55);
        b = Math.floor(255 - t * 255);
      } else if (temp < 0.7) {
        const t = (temp - 0.55) / 0.15;
        r = Math.floor(t * 255);
        g = 255;
        b = 0;
      } else if (temp < 0.85) {
        const t = (temp - 0.7) / 0.15;
        r = 255;
        g = Math.floor(255 - t * 180);
        b = 0;
      } else {
        const t = (temp - 0.85) / 0.15;
        r = 255;
        g = Math.floor(75 + t * 180);
        b = Math.floor(t * 255);
      }

      // Amplify disturbance regions — make fog/smoke/mist glow brightly
      if (disturbance > 0.35) {
        const dIntensity = (disturbance - 0.35) / 0.65 * sensitivityFactor;
        // Push toward hot white/yellow to make disturbances visually pop
        r = Math.min(255, r + dIntensity * 120);
        g = Math.min(255, g + dIntensity * 80);
        b = Math.min(255, b + dIntensity * 40);
      }

      // Highlight anomalous regions with pulsing glow effect
      if (anomalies[edgeIdx] > 0.5) {
        const glowIntensity = anomalies[edgeIdx] * sensitivityFactor;
        r = Math.min(255, r + 60 * glowIntensity);
        g = Math.min(255, g + 30 * glowIntensity);
      }

      data[i] = r;
      data[i + 1] = g;
      data[i + 2] = b;
    }
  }

  ctx.putImageData(imageData, 0, 0);

  // --- Disturbance halo overlay: draw glowing blobs over detected disturbance regions ---
  const haloCanvas = document.createElement("canvas");
  haloCanvas.width = width;
  haloCanvas.height = height;
  const haloCtx = haloCanvas.getContext("2d")!;
  
  // Sample disturbance map at intervals to place glow centers
  const step = 32;
  for (let y = step; y < height - step; y += step) {
    for (let x = step; x < width - step; x += step) {
      const d = disturbances[y * width + x];
      if (d > 0.45) {
        const radius = step * (1 + d * 2);
        const alpha = (d - 0.45) * sensitivityFactor * 0.6;
        const grad = haloCtx.createRadialGradient(x, y, 0, x, y, radius);
        grad.addColorStop(0, `rgba(255, 200, 50, ${alpha})`);
        grad.addColorStop(0.4, `rgba(255, 120, 0, ${alpha * 0.5})`);
        grad.addColorStop(1, `rgba(255, 50, 0, 0)`);
        haloCtx.fillStyle = grad;
        haloCtx.fillRect(x - radius, y - radius, radius * 2, radius * 2);
      }
    }
  }
  
  ctx.globalCompositeOperation = "screen";
  ctx.drawImage(haloCanvas, 0, 0);
  ctx.globalCompositeOperation = "source-over";

  // Energy field glow on edges
  const glowCanvas = document.createElement("canvas");
  glowCanvas.width = width;
  glowCanvas.height = height;
  const glowCtx = glowCanvas.getContext("2d")!;
  const glowData = glowCtx.createImageData(width, height);
  
  for (let i = 0; i < edges.length; i++) {
    const edgeStrength = edges[i] * sensitivityFactor;
    if (edgeStrength > 0.2) {
      glowData.data[i * 4] = 255;
      glowData.data[i * 4 + 1] = 100;
      glowData.data[i * 4 + 2] = 0;
      glowData.data[i * 4 + 3] = Math.min(255, edgeStrength * 200);
    }
  }
  
  glowCtx.putImageData(glowData, 0, 0);
  ctx.globalCompositeOperation = "screen";
  ctx.filter = "blur(3px)";
  ctx.drawImage(glowCanvas, 0, 0);
  ctx.filter = "none";
  ctx.globalCompositeOperation = "source-over";

  // Scan line noise
  ctx.globalAlpha = 0.08 * sensitivityFactor;
  for (let y = 0; y < height; y += 2) {
    ctx.fillStyle = y % 4 === 0 ? "rgba(255,100,0,0.3)" : "rgba(0,150,255,0.2)";
    ctx.fillRect(0, y, width, 1);
  }
  ctx.globalAlpha = 1;
}

// Apply hyperspectral with interdimensional frequency detection
function applyHyperspectralFilter(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  bands: number
) {
  const imageData = ctx.getImageData(0, 0, width, height);
  const data = imageData.data;
  const bandFactor = bands / 100;
  
  const edges = detectEdges(data, width, height);
  const anomalies = detectAnomalies(data, width, height, 12);

  // Create false-color spectral mapping
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const i = (y * width + x) * 4;
      const edgeIdx = y * width + x;
      
      const r = data[i];
      const g = data[i + 1];
      const b = data[i + 2];

      // Simulate multiple spectral bands with dramatic separation
      const nearIR = Math.min(255, r * 0.6 + g * 0.4 + b * 0.2 + 20);
      const redEdge = Math.min(255, Math.max(0, r * 1.4 - g * 0.3 - b * 0.1));
      const vegetation = Math.min(255, Math.max(0, g * 1.6 - r * 0.4 - b * 0.2));
      const blueViolet = Math.min(255, Math.max(0, b * 1.3 + r * 0.2 - g * 0.3));
      const ultraviolet = Math.min(255, Math.max(0, b * 0.8 + (255 - r) * 0.3));

      // Spectral unmixing - find hidden frequencies
      const spectralAnomaly = anomalies[edgeIdx] * bandFactor;
      const edgeEnhance = edges[edgeIdx] * bandFactor * 1.5;
      
      // Create dramatic false color based on spectral signatures
      let newR, newG, newB;
      
      if (bandFactor < 0.5) {
        // Lower bands: emphasize red-edge (entity detection)
        newR = Math.min(255, redEdge * (1 + bandFactor) + spectralAnomaly * 80);
        newG = Math.min(255, vegetation * bandFactor * 2 + nearIR * (1 - bandFactor));
        newB = Math.min(255, blueViolet * bandFactor + ultraviolet * (1 - bandFactor));
      } else {
        // Higher bands: full spectral unmixing
        newR = Math.min(255, nearIR * 0.4 + redEdge * 0.6 + spectralAnomaly * 100);
        newG = Math.min(255, vegetation * 0.7 + spectralAnomaly * 60 + edgeEnhance * 40);
        newB = Math.min(255, ultraviolet * 0.5 + blueViolet * 0.5 + edgeEnhance * 60);
      }

      // Enhance anomalous regions with ethereal glow
      if (spectralAnomaly > 0.3) {
        newG = Math.min(255, newG + spectralAnomaly * 100);
        newB = Math.min(255, newB + spectralAnomaly * 50);
      }

      // Edge highlighting for dimensional boundaries
      if (edgeEnhance > 0.3) {
        newR = Math.min(255, newR + edgeEnhance * 30);
        newG = Math.min(255, newG + edgeEnhance * 50);
      }

      data[i] = Math.max(0, newR);
      data[i + 1] = Math.max(0, newG);
      data[i + 2] = Math.max(0, newB);
    }
  }

  ctx.putImageData(imageData, 0, 0);

  // Add spectral band separation lines
  ctx.globalAlpha = 0.15 * bandFactor;
  const bandCount = Math.floor(5 + bandFactor * 10);
  for (let i = 0; i < bandCount; i++) {
    const hue = (i / bandCount) * 360;
    const y = (i / bandCount) * height;
    ctx.fillStyle = `hsla(${hue}, 100%, 50%, 0.3)`;
    ctx.fillRect(0, y, width, 2);
  }
  ctx.globalAlpha = 1;

  // Ethereal glow overlay for detected entities
  const gradient = ctx.createRadialGradient(
    width * 0.3, height * 0.4, 0,
    width * 0.3, height * 0.4, width * 0.5
  );
  gradient.addColorStop(0, `rgba(0, 255, 150, ${0.1 * bandFactor})`);
  gradient.addColorStop(0.5, `rgba(100, 255, 200, ${0.05 * bandFactor})`);
  gradient.addColorStop(1, "transparent");
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, width, height);
}

// Apply polarimetric with aura/energy field detection
function applyPolarimetricFilter(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  angle: number
) {
  const imageData = ctx.getImageData(0, 0, width, height);
  const data = imageData.data;
  const angleFactor = angle / 100;
  const angleRad = angleFactor * Math.PI * 2;
  
  const edges = detectEdges(data, width, height);
  const anomalies = detectAnomalies(data, width, height, 16);

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const i = (y * width + x) * 4;
      const edgeIdx = y * width + x;
      
      const r = data[i];
      const g = data[i + 1];
      const b = data[i + 2];

      // Calculate local gradient for stress/energy patterns
      let gx = 0, gy = 0;
      if (x > 0 && x < width - 1 && y > 0 && y < height - 1) {
        const left = (data[i - 4] + data[i - 3] + data[i - 2]) / 3;
        const right = (data[i + 4] + data[i + 5] + data[i + 6]) / 3;
        const top = (data[i - width * 4] + data[i - width * 4 + 1] + data[i - width * 4 + 2]) / 3;
        const bottom = (data[i + width * 4] + data[i + width * 4 + 1] + data[i + width * 4 + 2]) / 3;
        gx = right - left;
        gy = bottom - top;
      }

      // Calculate polarization and birefringence
      const gradAngle = Math.atan2(gy, gx);
      const polarization = Math.abs(Math.cos(gradAngle * 2 - angleRad));
      const stress = Math.sqrt(gx * gx + gy * gy) / 255;
      const edgeStrength = edges[edgeIdx];
      const anomalyStrength = anomalies[edgeIdx];

      // Create iridescent aura colors based on polarization
      const hue = ((gradAngle + Math.PI + angleRad) / (2 * Math.PI)) * 360;
      const saturation = Math.min(1, stress * angleFactor * 3 + anomalyStrength * 0.5);
      const lightness = 0.5 + polarization * 0.3;
      
      const auraColor = hslToRgb(hue / 360, saturation, lightness);

      // Blend with dramatic polarimetric visualization
      const blend = angleFactor * 0.7 * (stress + anomalyStrength * 0.5);
      const edgeBlend = edgeStrength * angleFactor * 0.5;
      
      // Base color with polarization tint
      let newR = r * (1 - blend) + auraColor.r * blend;
      let newG = g * (1 - blend) + auraColor.g * blend;
      let newB = b * (1 - blend) + auraColor.b * blend;

      // Add violet/purple aura effect at edges (entity boundaries)
      newR = Math.min(255, newR + edgeBlend * 100 + polarization * 40 * angleFactor);
      newG = Math.min(255, newG + edgeBlend * 20);
      newB = Math.min(255, newB + edgeBlend * 150 + (1 - polarization) * 60 * angleFactor);

      // Highlight anomalous regions with bright aura
      if (anomalyStrength > 0.4) {
        const glow = anomalyStrength * angleFactor;
        newR = Math.min(255, newR + glow * 80);
        newG = Math.min(255, newG + glow * 40);
        newB = Math.min(255, newB + glow * 120);
      }

      data[i] = Math.max(0, Math.min(255, newR));
      data[i + 1] = Math.max(0, Math.min(255, newG));
      data[i + 2] = Math.max(0, Math.min(255, newB));
    }
  }

  ctx.putImageData(imageData, 0, 0);

  // Add rotating polarization cross pattern
  ctx.save();
  ctx.translate(width / 2, height / 2);
  ctx.rotate(angleRad);
  
  const crossGradient = ctx.createLinearGradient(-width, 0, width, 0);
  crossGradient.addColorStop(0, `rgba(150, 50, 255, ${0.1 * angleFactor})`);
  crossGradient.addColorStop(0.5, `rgba(255, 100, 255, ${0.2 * angleFactor})`);
  crossGradient.addColorStop(1, `rgba(150, 50, 255, ${0.1 * angleFactor})`);
  
  ctx.fillStyle = crossGradient;
  ctx.fillRect(-width, -2, width * 2, 4);
  ctx.fillRect(-2, -height, 4, height * 2);
  ctx.restore();

  // Ethereal vignette with purple glow
  const vignette = ctx.createRadialGradient(
    width / 2, height / 2, 0,
    width / 2, height / 2, Math.max(width, height) * 0.7
  );
  vignette.addColorStop(0, "transparent");
  vignette.addColorStop(0.6, `rgba(100, 50, 200, ${0.15 * angleFactor})`);
  vignette.addColorStop(0.8, `rgba(80, 30, 180, ${0.25 * angleFactor})`);
  vignette.addColorStop(1, `rgba(40, 10, 120, ${0.4 * angleFactor})`);
  ctx.fillStyle = vignette;
  ctx.fillRect(0, 0, width, height);
}

// Apply realistic glass pane + reflection filter with spirit detection
function applyReflectionFilter(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  settings: FilterSettings
) {
  const imageData = ctx.getImageData(0, 0, width, height);
  const data = imageData.data;
  
  const reflectIntensity = settings.reflectionIntensity / 100;
  const lightIntensity = settings.lightBleed / 100;
  const shadowIntensity = settings.shadowDepth / 100;
  const focusDist = settings.focusDistance / 100; // 0=bg sharp, 0.5=glass plane, 1=fg sharp
  const panes = Math.max(1, Math.min(3, Math.round((settings.glassPanes ?? 50) / 33.4 + 1)));
  
  const edges = detectEdges(data, width, height);
  const anomalies = detectAnomalies(data, width, height, 10);

  // --- Pass 1: Depth-of-field blur based on focus distance ---
  // When focus is at midpoint (glass plane), the background gets blurred
  // simulating focusing between camera and subject
  const blurRadius = Math.round(focusDist * 4); // 0-4px blur on background
  let blurredData: Uint8ClampedArray | null = null;
  
  if (blurRadius > 0) {
    // Simple box blur for depth-of-field effect
    blurredData = new Uint8ClampedArray(data.length);
    const r = blurRadius;
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        let sumR = 0, sumG = 0, sumB = 0, count = 0;
        for (let dy = -r; dy <= r; dy++) {
          for (let dx = -r; dx <= r; dx++) {
            const nx = Math.min(width - 1, Math.max(0, x + dx));
            const ny = Math.min(height - 1, Math.max(0, y + dy));
            const ni = (ny * width + nx) * 4;
            sumR += data[ni];
            sumG += data[ni + 1];
            sumB += data[ni + 2];
            count++;
          }
        }
        const i = (y * width + x) * 4;
        blurredData[i] = sumR / count;
        blurredData[i + 1] = sumG / count;
        blurredData[i + 2] = sumB / count;
        blurredData[i + 3] = 255;
      }
    }
  }

  // --- Pass 2: Per-pixel glass simulation ---
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const i = (y * width + x) * 4;
      const edgeIdx = y * width + x;
      
      // Start from depth-blurred image if focusing on glass plane
      let r: number, g: number, b: number;
      if (blurredData) {
        r = blurredData[i];
        g = blurredData[i + 1];
        b = blurredData[i + 2];
      } else {
        r = data[i];
        g = data[i + 1];
        b = data[i + 2];
      }
      
      // --- Glass refraction: slight chromatic aberration per pane ---
      for (let p = 0; p < panes; p++) {
        const paneOffset = (p + 1) * 2 * reflectIntensity;
        // Red channel shifts right, blue shifts left (chromatic aberration)
        const srcXr = Math.min(width - 1, Math.max(0, Math.floor(x + paneOffset)));
        const srcXb = Math.min(width - 1, Math.max(0, Math.floor(x - paneOffset)));
        const srcIr = (y * width + srcXr) * 4;
        const srcIb = (y * width + srcXb) * 4;
        const src = blurredData ?? data;
        
        const caBlend = 0.15 * reflectIntensity / panes;
        r = r * (1 - caBlend) + src[srcIr] * caBlend;
        b = b * (1 - caBlend) + src[srcIb + 2] * caBlend;
      }

      // --- Fresnel reflection: brighter at edges (grazing angles) ---
      const centerX = width / 2;
      const centerY = height / 2;
      const nx = (x - centerX) / centerX; // -1 to 1
      const ny = (y - centerY) / centerY;
      const viewAngle = Math.sqrt(nx * nx + ny * ny); // 0 at center, ~1.4 at corners
      // Schlick's approximation: R = R0 + (1-R0)(1-cos(theta))^5
      const R0 = 0.04; // glass refractive index ~1.5
      const cosTheta = Math.max(0, 1 - Math.min(1, viewAngle));
      const fresnelReflectance = R0 + (1 - R0) * Math.pow(1 - cosTheta, 5);
      const fresnelBoost = fresnelReflectance * reflectIntensity * 200;
      
      r = Math.min(255, r + fresnelBoost);
      g = Math.min(255, g + fresnelBoost);
      b = Math.min(255, b + fresnelBoost * 1.1); // glass reflects slightly blue

      // --- Glass surface distortion waves (per pane) ---
      for (let p = 0; p < panes; p++) {
        const freq = 0.025 + p * 0.01;
        const phase = p * 1.5;
        const distortX = Math.sin((x + y * 0.5) * freq + phase) * 6 * reflectIntensity;
        const distortY = Math.cos((y + x * 0.3) * freq * 0.8 + phase) * 3 * reflectIntensity;
        
        const srcX = Math.min(width - 1, Math.max(0, Math.floor(x + distortX)));
        const srcY = Math.min(height - 1, Math.max(0, Math.floor(y + distortY)));
        const srcI = (srcY * width + srcX) * 4;
        const src = blurredData ?? data;
        
        const distortBlend = 0.12 * reflectIntensity / panes;
        r = r * (1 - distortBlend) + src[srcI] * distortBlend;
        g = g * (1 - distortBlend) + src[srcI + 1] * distortBlend;
        b = b * (1 - distortBlend) + src[srcI + 2] * distortBlend;
      }

      // --- Mirror plane reflection (from alternate side) ---
      const mirrorX = width - x - 1;
      const mirrorI = (y * width + mirrorX) * 4;
      const mirrorBlend = reflectIntensity * 0.2 * fresnelReflectance * 3;
      const src = blurredData ?? data;
      r = r + (src[mirrorI] - r) * mirrorBlend;
      g = g + (src[mirrorI + 1] - g) * mirrorBlend;
      b = b + (src[mirrorI + 2] - b) * mirrorBlend;

      // --- Light bleed from other dimensions ---
      const diagonalFactor = Math.sin((x + y) * 0.015) * 0.5 + 0.5;
      const lightBleedEffect = Math.pow(diagonalFactor, 1.5) * lightIntensity * 60;
      
      // --- Shadow depth for hidden entities ---
      const luminance = (r * 0.299 + g * 0.587 + b * 0.114) / 255;
      const shadowEnhance = luminance < 0.35 ? (0.35 - luminance) * shadowIntensity * 60 : 0;
      
      // Edge highlighting for spirit forms
      const edgeGlow = edges[edgeIdx] * reflectIntensity * 40;
      const anomalyGlow = anomalies[edgeIdx] * reflectIntensity * 30;
      
      r = Math.min(255, r + lightBleedEffect - shadowEnhance + edgeGlow);
      g = Math.min(255, g + lightBleedEffect * 0.85 - shadowEnhance + edgeGlow * 0.8);
      b = Math.min(255, b + lightBleedEffect * 1.3 - shadowEnhance + edgeGlow * 1.2 + anomalyGlow);
      
      // Vignette (natural lens darkening)
      const distFromCenter = Math.sqrt((x - centerX) ** 2 + (y - centerY) ** 2);
      const maxDist = Math.sqrt(centerX ** 2 + centerY ** 2);
      const vignette = 1 - (distFromCenter / maxDist) * 0.35 * reflectIntensity;
      
      data[i] = Math.max(0, Math.min(255, r * vignette));
      data[i + 1] = Math.max(0, Math.min(255, g * vignette));
      data[i + 2] = Math.max(0, Math.min(255, b * vignette));
    }
  }

  ctx.putImageData(imageData, 0, 0);

  // --- Glass surface highlight streaks (specular reflections on panes) ---
  for (let p = 0; p < panes; p++) {
    const angle = 120 + p * 25;
    const opacity = 0.06 * reflectIntensity * (1 + focusDist * 0.5);
    const grad = ctx.createLinearGradient(
      0, 0,
      width * Math.cos(angle * Math.PI / 180),
      height * Math.sin(angle * Math.PI / 180)
    );
    grad.addColorStop(0, `rgba(255, 255, 255, ${opacity})`);
    grad.addColorStop(0.3, `rgba(220, 235, 255, ${opacity * 0.5})`);
    grad.addColorStop(0.5, `transparent`);
    grad.addColorStop(0.7, `rgba(200, 220, 255, ${opacity * 0.4})`);
    grad.addColorStop(1, `rgba(255, 255, 255, ${opacity * 0.6})`);
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, width, height);
  }

  // --- Ethereal glass reflection overlay ---
  const gradient1 = ctx.createLinearGradient(0, 0, width, height);
  gradient1.addColorStop(0, `rgba(255, 255, 255, ${0.06 * reflectIntensity})`);
  gradient1.addColorStop(0.25, `rgba(200, 230, 255, ${0.03 * reflectIntensity})`);
  gradient1.addColorStop(0.5, `rgba(180, 200, 255, ${0.04 * reflectIntensity})`);
  gradient1.addColorStop(0.75, `rgba(255, 255, 255, ${0.02 * reflectIntensity})`);
  gradient1.addColorStop(1, `rgba(200, 220, 255, ${0.05 * reflectIntensity})`);
  ctx.fillStyle = gradient1;
  ctx.fillRect(0, 0, width, height);

  // Spirit mist overlay (enhanced by focus on glass plane)
  const mistStrength = lightIntensity * (0.5 + focusDist);
  const mistGradient = ctx.createRadialGradient(
    width * 0.7, height * 0.3, 0,
    width * 0.7, height * 0.3, width * 0.6
  );
  mistGradient.addColorStop(0, `rgba(200, 220, 255, ${0.12 * mistStrength})`);
  mistGradient.addColorStop(0.5, `rgba(180, 200, 240, ${0.06 * mistStrength})`);
  mistGradient.addColorStop(1, "transparent");
  ctx.fillStyle = mistGradient;
  ctx.fillRect(0, 0, width, height);
}

// HSL to RGB helper
function hslToRgb(h: number, s: number, l: number): { r: number; g: number; b: number } {
  let r, g, b;

  if (s === 0) {
    r = g = b = l;
  } else {
    const hue2rgb = (p: number, q: number, t: number) => {
      if (t < 0) t += 1;
      if (t > 1) t -= 1;
      if (t < 1/6) return p + (q - p) * 6 * t;
      if (t < 1/2) return q;
      if (t < 2/3) return p + (q - p) * (2/3 - t) * 6;
      return p;
    };

    const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
    const p = 2 * l - q;
    r = hue2rgb(p, q, h + 1/3);
    g = hue2rgb(p, q, h);
    b = hue2rgb(p, q, h - 1/3);
  }

  return {
    r: Math.round(r * 255),
    g: Math.round(g * 255),
    b: Math.round(b * 255),
  };
}

export function applyImagingFilter(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  mode: ImagingMode,
  settings: FilterSettings
) {
  switch (mode) {
    case "thermal":
      applyThermalFilter(ctx, width, height, settings.thermalSensitivity);
      break;
    case "hyperspectral":
      applyHyperspectralFilter(ctx, width, height, settings.spectralBands);
      break;
    case "polarimetric":
      applyPolarimetricFilter(ctx, width, height, settings.polarizationAngle);
      break;
    case "reflection":
    default:
      applyReflectionFilter(ctx, width, height, settings);
      break;
  }
}

// Enhanced live preview filters
export function getLivePreviewFilter(mode: ImagingMode, settings: FilterSettings): string {
  switch (mode) {
    case "thermal":
      return `
        saturate(${0.1 + settings.thermalSensitivity / 150})
        contrast(${1.4 + settings.thermalSensitivity / 150})
        hue-rotate(${200 - settings.thermalSensitivity * 2.2}deg)
        brightness(${1.1 + settings.thermalSensitivity / 400})
      `;
    case "hyperspectral":
      return `
        saturate(${2 + settings.spectralBands / 50})
        contrast(${1.3 + settings.spectralBands / 200})
        brightness(${1.05 + settings.spectralBands / 400})
        hue-rotate(${settings.spectralBands * 0.5}deg)
      `;
    case "polarimetric":
      return `
        contrast(${1.4 + settings.polarizationAngle / 150})
        saturate(${1.2 + settings.polarizationAngle / 150})
        brightness(${0.9 + settings.polarizationAngle / 300})
        hue-rotate(${270 + settings.polarizationAngle}deg)
      `;
    case "reflection":
    default: {
      const blurPx = (settings.focusDistance / 100) * 3;
      return `
        contrast(${1.1 + settings.shadowDepth / 150})
        brightness(${1.05 + settings.lightBleed / 200})
        saturate(${1.1 + settings.reflectionIntensity / 300})
        blur(${blurPx}px)
      `;
    }
  }
}

// Enhanced live preview overlays
export function getLivePreviewOverlay(mode: ImagingMode, settings: FilterSettings): string {
  switch (mode) {
    case "thermal":
      return `
        linear-gradient(
          180deg,
          rgba(255, 50, 0, ${0.25 * settings.thermalSensitivity / 100}) 0%,
          rgba(255, 150, 0, ${0.15 * settings.thermalSensitivity / 100}) 25%,
          rgba(0, 200, 100, ${0.1 * settings.thermalSensitivity / 100}) 50%,
          rgba(0, 100, 255, ${0.15 * settings.thermalSensitivity / 100}) 75%,
          rgba(50, 0, 150, ${0.25 * settings.thermalSensitivity / 100}) 100%
        )
      `;
    case "hyperspectral":
      return `
        linear-gradient(
          45deg,
          rgba(255, 0, 100, ${0.12 * settings.spectralBands / 100}) 0%,
          rgba(0, 255, 100, ${0.15 * settings.spectralBands / 100}) 25%,
          rgba(0, 100, 255, ${0.12 * settings.spectralBands / 100}) 50%,
          rgba(255, 255, 0, ${0.1 * settings.spectralBands / 100}) 75%,
          rgba(255, 0, 255, ${0.12 * settings.spectralBands / 100}) 100%
        )
      `;
    case "polarimetric":
      return `
        radial-gradient(
          ellipse at ${50 + Math.sin(settings.polarizationAngle * 0.1) * 20}% ${50 + Math.cos(settings.polarizationAngle * 0.1) * 20}%,
          rgba(200, 100, 255, ${0.15 * settings.polarizationAngle / 100}) 0%,
          rgba(100, 50, 200, ${0.2 * settings.polarizationAngle / 100}) 40%,
          rgba(80, 30, 180, ${0.3 * settings.polarizationAngle / 100}) 70%,
          rgba(40, 10, 120, ${0.4 * settings.polarizationAngle / 100}) 100%
        )
      `;
    case "reflection":
    default: {
      const ri = settings.reflectionIntensity / 100;
      const fd = settings.focusDistance / 100;
      const panes = Math.max(1, Math.min(3, Math.round((settings.glassPanes ?? 50) / 33.4 + 1)));
      // Layer multiple glass streaks per pane
      const streaks = Array.from({ length: panes }, (_, p) => {
        const angle = 120 + p * 30;
        const o = 0.08 * ri * (0.5 + fd * 0.5);
        return `linear-gradient(${angle}deg, rgba(255,255,255,${o}) 0%, rgba(220,235,255,${o * 0.4}) 30%, transparent 50%, rgba(200,220,255,${o * 0.3}) 70%, rgba(255,255,255,${o * 0.5}) 100%)`;
      });
      return `
        ${streaks.join(", ")},
        radial-gradient(ellipse at center, transparent 40%, rgba(0,0,0,${0.15 * ri}) 100%)
      `;
    }
  }
}
