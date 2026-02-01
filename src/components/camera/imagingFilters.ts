import { ImagingMode } from "./ImagingModeSelector";

interface FilterSettings {
  reflectionIntensity: number;
  lightBleed: number;
  shadowDepth: number;
  thermalSensitivity: number;
  spectralBands: number;
  polarizationAngle: number;
}

// Apply thermal infrared simulation - converts luminance to heat map colors
function applyThermalFilter(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  sensitivity: number
) {
  const imageData = ctx.getImageData(0, 0, width, height);
  const data = imageData.data;
  const sensitivityFactor = sensitivity / 100;

  for (let i = 0; i < data.length; i += 4) {
    // Calculate luminance as "temperature"
    const luminance = (data[i] * 0.299 + data[i + 1] * 0.587 + data[i + 2] * 0.114) / 255;
    
    // Apply sensitivity curve - higher sensitivity detects subtler temperature differences
    const temp = Math.pow(luminance, 1 - sensitivityFactor * 0.5);
    
    // Map temperature to thermal color palette (cold blue -> warm red -> hot white)
    let r: number, g: number, b: number;
    
    if (temp < 0.25) {
      // Cold: dark blue to blue
      const t = temp / 0.25;
      r = 0;
      g = 0;
      b = Math.floor(80 + t * 175);
    } else if (temp < 0.5) {
      // Cool: blue to cyan/green
      const t = (temp - 0.25) / 0.25;
      r = 0;
      g = Math.floor(t * 200);
      b = Math.floor(255 - t * 100);
    } else if (temp < 0.75) {
      // Warm: green/yellow to orange
      const t = (temp - 0.5) / 0.25;
      r = Math.floor(t * 255);
      g = Math.floor(200 - t * 50);
      b = Math.floor(155 - t * 155);
    } else {
      // Hot: orange to red to white
      const t = (temp - 0.75) / 0.25;
      r = 255;
      g = Math.floor(150 + t * 105);
      b = Math.floor(t * 200);
    }

    data[i] = r;
    data[i + 1] = g;
    data[i + 2] = b;
  }

  ctx.putImageData(imageData, 0, 0);

  // Add thermal noise effect
  const noiseCanvas = document.createElement("canvas");
  noiseCanvas.width = width;
  noiseCanvas.height = height;
  const noiseCtx = noiseCanvas.getContext("2d")!;
  const noiseData = noiseCtx.createImageData(width, height);
  
  for (let i = 0; i < noiseData.data.length; i += 4) {
    const noise = Math.random() * 20 - 10;
    noiseData.data[i] = noise > 0 ? noise : 0;
    noiseData.data[i + 1] = noise > 0 ? noise : 0;
    noiseData.data[i + 2] = noise > 0 ? noise : 0;
    noiseData.data[i + 3] = Math.abs(noise) * sensitivityFactor * 2;
  }
  
  noiseCtx.putImageData(noiseData, 0, 0);
  ctx.globalAlpha = 0.15;
  ctx.drawImage(noiseCanvas, 0, 0);
  ctx.globalAlpha = 1;
}

// Apply hyperspectral imaging simulation - separates and enhances different wavelength bands
function applyHyperspectralFilter(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  bands: number
) {
  const imageData = ctx.getImageData(0, 0, width, height);
  const data = imageData.data;
  const bandFactor = bands / 100;

  // Create multiple "spectral bands" by separating color channels
  for (let i = 0; i < data.length; i += 4) {
    const r = data[i];
    const g = data[i + 1];
    const b = data[i + 2];

    // Simulate different spectral bands with false color mapping
    // Band separation increases with bandFactor
    const nearIR = (r * 0.5 + g * 0.3 + b * 0.2); // Near-infrared simulation
    const redEdge = (r * 0.8 - g * 0.2 + b * 0.1); // Red edge detection
    const greenPeak = (g * 1.2 - r * 0.1 - b * 0.1); // Chlorophyll-like detection
    const blueViolet = (b * 0.9 + r * 0.1 - g * 0.2); // Short wavelength

    // Mix bands based on intensity setting
    const mix = bandFactor;
    data[i] = Math.min(255, Math.max(0, r * (1 - mix) + (nearIR * 0.3 + redEdge * 0.7) * mix));
    data[i + 1] = Math.min(255, Math.max(0, g * (1 - mix) + greenPeak * mix));
    data[i + 2] = Math.min(255, Math.max(0, b * (1 - mix) + blueViolet * mix));

    // Enhance contrast between bands
    const avg = (data[i] + data[i + 1] + data[i + 2]) / 3;
    data[i] = Math.min(255, data[i] + (data[i] - avg) * bandFactor * 0.5);
    data[i + 1] = Math.min(255, data[i + 1] + (data[i + 1] - avg) * bandFactor * 0.5);
    data[i + 2] = Math.min(255, data[i + 2] + (data[i + 2] - avg) * bandFactor * 0.5);
  }

  ctx.putImageData(imageData, 0, 0);

  // Add spectral band overlay lines
  ctx.globalAlpha = 0.1 * bandFactor;
  for (let y = 0; y < height; y += 3) {
    const hue = (y / height) * 360;
    ctx.fillStyle = `hsl(${hue}, 100%, 50%)`;
    ctx.fillRect(0, y, width, 1);
  }
  ctx.globalAlpha = 1;
}

// Apply polarimetric imaging simulation - reveals surface stress and hidden patterns
function applyPolarimetricFilter(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  angle: number
) {
  const imageData = ctx.getImageData(0, 0, width, height);
  const data = imageData.data;
  const angleFactor = angle / 100;
  const angleRad = angleFactor * Math.PI;

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const i = (y * width + x) * 4;
      
      const r = data[i];
      const g = data[i + 1];
      const b = data[i + 2];

      // Calculate local gradient (edge detection for stress patterns)
      let gx = 0, gy = 0;
      if (x > 0 && x < width - 1 && y > 0 && y < height - 1) {
        const left = (data[i - 4] + data[i - 3] + data[i - 2]) / 3;
        const right = (data[i + 4] + data[i + 5] + data[i + 6]) / 3;
        const top = (data[i - width * 4] + data[i - width * 4 + 1] + data[i - width * 4 + 2]) / 3;
        const bottom = (data[i + width * 4] + data[i + width * 4 + 1] + data[i + width * 4 + 2]) / 3;
        gx = right - left;
        gy = bottom - top;
      }

      // Calculate polarization-like effect based on gradient angle
      const gradAngle = Math.atan2(gy, gx);
      const polarization = Math.abs(Math.cos(gradAngle - angleRad));
      const stress = Math.sqrt(gx * gx + gy * gy) / 255;

      // Map to iridescent color based on "stress" (birefringence simulation)
      const hue = ((gradAngle + Math.PI) / (2 * Math.PI)) * 360;
      const saturation = stress * angleFactor * 100;
      
      // Convert HSL to RGB for stress overlay
      const stressColor = hslToRgb(hue / 360, Math.min(1, saturation / 100), 0.5);

      // Blend original with polarimetric visualization
      const blend = angleFactor * 0.6 * stress;
      data[i] = Math.min(255, r * (1 - blend) + stressColor.r * blend + polarization * 30 * angleFactor);
      data[i + 1] = Math.min(255, g * (1 - blend) + stressColor.g * blend);
      data[i + 2] = Math.min(255, b * (1 - blend) + stressColor.b * blend + (1 - polarization) * 30 * angleFactor);
    }
  }

  ctx.putImageData(imageData, 0, 0);

  // Add cross-polarization vignette effect
  const gradient = ctx.createRadialGradient(
    width / 2, height / 2, 0,
    width / 2, height / 2, Math.max(width, height) / 2
  );
  gradient.addColorStop(0, "transparent");
  gradient.addColorStop(0.7, `rgba(100, 50, 150, ${0.1 * angleFactor})`);
  gradient.addColorStop(1, `rgba(50, 0, 100, ${0.3 * angleFactor})`);
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, width, height);
}

// Apply reflection filter (existing functionality)
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

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const i = (y * width + x) * 4;
      
      const diagonalFactor = Math.sin((x + y) * 0.02) * 0.5 + 0.5;
      const horizontalWave = Math.sin(x * 0.01) * 0.3 + 0.7;
      
      const lightBleedEffect = Math.pow(diagonalFactor, 2) * lightIntensity * 60;
      
      const luminance = (data[i] * 0.299 + data[i + 1] * 0.587 + data[i + 2] * 0.114) / 255;
      const shadowEnhance = luminance < 0.4 ? (0.4 - luminance) * shadowIntensity * 50 : 0;
      
      const reflectionOffset = Math.floor(width * 0.1);
      const mirrorX = width - x - 1;
      const mirrorI = (y * width + Math.min(mirrorX + reflectionOffset, width - 1)) * 4;
      
      const reflectBlend = reflectIntensity * 0.3 * horizontalWave;
      
      data[i] = Math.min(255, data[i] + lightBleedEffect - shadowEnhance + (data[mirrorI] - data[i]) * reflectBlend);
      data[i + 1] = Math.min(255, data[i + 1] + lightBleedEffect * 0.9 - shadowEnhance + (data[mirrorI + 1] - data[i + 1]) * reflectBlend);
      data[i + 2] = Math.min(255, data[i + 2] + lightBleedEffect * 1.2 - shadowEnhance + (data[mirrorI + 2] - data[i + 2]) * reflectBlend);
      
      const centerX = width / 2;
      const centerY = height / 2;
      const distFromCenter = Math.sqrt(Math.pow(x - centerX, 2) + Math.pow(y - centerY, 2));
      const maxDist = Math.sqrt(Math.pow(centerX, 2) + Math.pow(centerY, 2));
      const vignette = 1 - (distFromCenter / maxDist) * 0.3;
      
      data[i] *= vignette;
      data[i + 1] *= vignette;
      data[i + 2] *= vignette;
    }
  }

  ctx.putImageData(imageData, 0, 0);

  const gradient = ctx.createLinearGradient(0, 0, width, height);
  gradient.addColorStop(0, `rgba(255, 255, 255, ${0.05 * reflectIntensity})`);
  gradient.addColorStop(0.3, `rgba(200, 220, 255, ${0.02 * reflectIntensity})`);
  gradient.addColorStop(0.7, `rgba(255, 255, 255, ${0.03 * reflectIntensity})`);
  gradient.addColorStop(1, `rgba(180, 200, 255, ${0.04 * reflectIntensity})`);
  
  ctx.fillStyle = gradient;
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

// Get CSS filter string for live preview
export function getLivePreviewFilter(mode: ImagingMode, settings: FilterSettings): string {
  switch (mode) {
    case "thermal":
      return `
        saturate(${0.2 + settings.thermalSensitivity / 200})
        contrast(${1.2 + settings.thermalSensitivity / 200})
        hue-rotate(${180 - settings.thermalSensitivity * 1.8}deg)
      `;
    case "hyperspectral":
      return `
        saturate(${1.5 + settings.spectralBands / 100})
        contrast(${1.1 + settings.spectralBands / 300})
        brightness(${1 + settings.spectralBands / 500})
      `;
    case "polarimetric":
      return `
        contrast(${1.3 + settings.polarizationAngle / 200})
        saturate(${0.8 + settings.polarizationAngle / 200})
        brightness(${0.95 + settings.polarizationAngle / 500})
      `;
    case "reflection":
    default:
      return `
        contrast(${1 + settings.shadowDepth / 200})
        brightness(${1 + settings.lightBleed / 300})
      `;
  }
}

// Get overlay gradient for live preview
export function getLivePreviewOverlay(mode: ImagingMode, settings: FilterSettings): string {
  switch (mode) {
    case "thermal":
      return `
        linear-gradient(
          180deg,
          rgba(255, 100, 0, ${0.15 * settings.thermalSensitivity / 100}) 0%,
          rgba(255, 200, 0, ${0.1 * settings.thermalSensitivity / 100}) 30%,
          rgba(0, 150, 255, ${0.1 * settings.thermalSensitivity / 100}) 70%,
          rgba(0, 50, 150, ${0.2 * settings.thermalSensitivity / 100}) 100%
        )
      `;
    case "hyperspectral":
      return `
        linear-gradient(
          90deg,
          rgba(255, 0, 0, ${0.08 * settings.spectralBands / 100}) 0%,
          rgba(0, 255, 0, ${0.08 * settings.spectralBands / 100}) 33%,
          rgba(0, 0, 255, ${0.08 * settings.spectralBands / 100}) 66%,
          rgba(255, 0, 255, ${0.08 * settings.spectralBands / 100}) 100%
        )
      `;
    case "polarimetric":
      return `
        radial-gradient(
          ellipse at center,
          transparent 30%,
          rgba(100, 50, 150, ${0.15 * settings.polarizationAngle / 100}) 70%,
          rgba(50, 0, 100, ${0.25 * settings.polarizationAngle / 100}) 100%
        )
      `;
    case "reflection":
    default:
      return `
        linear-gradient(
          135deg,
          rgba(255, 255, 255, ${0.08 * settings.reflectionIntensity / 100}) 0%,
          rgba(200, 220, 255, ${0.03 * settings.reflectionIntensity / 100}) 25%,
          transparent 50%,
          rgba(255, 255, 255, ${0.05 * settings.reflectionIntensity / 100}) 75%,
          rgba(180, 200, 255, ${0.06 * settings.reflectionIntensity / 100}) 100%
        )
      `;
  }
}
