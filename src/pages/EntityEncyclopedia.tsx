import { useState } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, Search, Filter, ChevronDown, ChevronUp, Shield, Eye, MapPin, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  entityEncyclopedia,
  EntityEntry,
  getCategoryColor,
  getCategoryIcon,
  getIntentColor,
  getPowerColor,
  getRarityColor,
} from "@/data/entityEncyclopedia";

const EntityCard = ({ entity, isExpanded, onToggle }: { 
  entity: EntityEntry; 
  isExpanded: boolean; 
  onToggle: () => void;
}) => {
  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
    >
      <Card className="bg-card/50 backdrop-blur-sm border-primary/20 overflow-hidden">
        <CardHeader 
          className="cursor-pointer hover:bg-primary/5 transition-colors"
          onClick={onToggle}
        >
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className={`w-12 h-12 rounded-full bg-gradient-to-br ${getCategoryColor(entity.category)} flex items-center justify-center text-2xl`}>
                {getCategoryIcon(entity.category)}
              </div>
              <div>
                <CardTitle className="text-lg flex items-center gap-2">
                  {entity.name}
                  <Badge variant="outline" className={getRarityColor(entity.rarity)}>
                    {entity.rarity}
                  </Badge>
                </CardTitle>
                <div className="flex items-center gap-2 mt-1">
                  <Badge className={getPowerColor(entity.powerLevel)}>
                    {entity.powerLevel} power
                  </Badge>
                  <span className={`text-sm ${getIntentColor(entity.intent)}`}>
                    {entity.intent}
                  </span>
                </div>
              </div>
            </div>
            <Button variant="ghost" size="icon">
              {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
            </Button>
          </div>
          <p className="text-sm text-muted-foreground mt-2">{entity.description}</p>
        </CardHeader>
        
        <AnimatePresence>
          {isExpanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3 }}
            >
              <CardContent className="pt-0 space-y-4">
                {/* Characteristics */}
                <div>
                  <h4 className="text-sm font-semibold text-primary flex items-center gap-2 mb-2">
                    <Sparkles className="h-4 w-4" />
                    Characteristics
                  </h4>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    {entity.characteristics.map((char, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <span className="text-primary">•</span>
                        {char}
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Visual Signs */}
                <div>
                  <h4 className="text-sm font-semibold text-primary flex items-center gap-2 mb-2">
                    <Eye className="h-4 w-4" />
                    Visual Signs
                  </h4>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    {entity.visualSigns.map((sign, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <span className="text-primary">•</span>
                        {sign}
                      </li>
                    ))}
                  </ul>
                </div>

                {/* How to Interact */}
                <div>
                  <h4 className="text-sm font-semibold text-primary flex items-center gap-2 mb-2">
                    💬 How to Interact
                  </h4>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    {entity.howToInteract.map((tip, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <span className="text-primary">{i + 1}.</span>
                        {tip}
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Protection Methods */}
                <div>
                  <h4 className="text-sm font-semibold text-primary flex items-center gap-2 mb-2">
                    <Shield className="h-4 w-4" />
                    Protection Methods
                  </h4>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    {entity.protectionMethods.map((method, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <span className="text-green-400">✓</span>
                        {method}
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Common Locations */}
                <div>
                  <h4 className="text-sm font-semibold text-primary flex items-center gap-2 mb-2">
                    <MapPin className="h-4 w-4" />
                    Common Locations
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {entity.commonLocations.map((loc, i) => (
                      <Badge key={i} variant="secondary" className="text-xs">
                        {loc}
                      </Badge>
                    ))}
                  </div>
                </div>
              </CardContent>
            </motion.div>
          )}
        </AnimatePresence>
      </Card>
    </motion.div>
  );
};

const EntityEncyclopedia = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const categories = ["all", "angel", "demon", "spirit", "elemental", "ancestor"];

  const filteredEntities = entityEncyclopedia.filter((entity) => {
    const matchesSearch = 
      entity.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      entity.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === "all" || entity.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const getCategoryStats = (category: string) => {
    if (category === "all") return entityEncyclopedia.length;
    return entityEncyclopedia.filter(e => e.category === category).length;
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-background to-primary/5">
      {/* Header */}
      <header className="sticky top-0 md:top-14 z-40 bg-background/80 backdrop-blur-lg border-b border-primary/20">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl font-bold bg-gradient-to-r from-primary to-purple-400 bg-clip-text text-transparent">
                Entity Encyclopedia
              </h1>
              <p className="text-xs text-muted-foreground">
                Bestiary of the Spiritual Realm
              </p>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6 space-y-6">
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search entities..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 bg-card/50 border-primary/20"
          />
        </div>

        {/* Category Tabs */}
        <Tabs value={selectedCategory} onValueChange={setSelectedCategory}>
          <TabsList className="w-full flex flex-wrap h-auto gap-1 bg-card/50">
            {categories.map((cat) => (
              <TabsTrigger
                key={cat}
                value={cat}
                className="flex-1 min-w-[80px] data-[state=active]:bg-primary/20"
              >
                <span className="mr-1">
                  {cat === "all" ? "📚" : getCategoryIcon(cat as EntityEntry["category"])}
                </span>
                <span className="capitalize text-xs sm:text-sm">{cat}</span>
                <Badge variant="secondary" className="ml-1 text-xs">
                  {getCategoryStats(cat)}
                </Badge>
              </TabsTrigger>
            ))}
          </TabsList>

          <TabsContent value={selectedCategory} className="mt-4">
            <div className="space-y-4">
              <AnimatePresence mode="popLayout">
                {filteredEntities.length > 0 ? (
                  filteredEntities.map((entity) => (
                    <EntityCard
                      key={entity.id}
                      entity={entity}
                      isExpanded={expandedId === entity.id}
                      onToggle={() => setExpandedId(expandedId === entity.id ? null : entity.id)}
                    />
                  ))
                ) : (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="text-center py-12"
                  >
                    <p className="text-muted-foreground">No entities found matching your search.</p>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </TabsContent>
        </Tabs>

        {/* Quick Legend */}
        <Card className="bg-card/30 border-primary/10">
          <CardHeader>
            <CardTitle className="text-sm">Power Levels & Intent Guide</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <p className="text-xs text-muted-foreground mb-2">Power Levels:</p>
              <div className="flex flex-wrap gap-2">
                <Badge className={getPowerColor('low')}>Low - Minimal threat</Badge>
                <Badge className={getPowerColor('medium')}>Medium - Caution advised</Badge>
                <Badge className={getPowerColor('high')}>High - Dangerous</Badge>
                <Badge className={getPowerColor('extreme')}>Extreme - Seek help</Badge>
              </div>
            </div>
            <div>
              <p className="text-xs text-muted-foreground mb-2">Intent Types:</p>
              <div className="flex flex-wrap gap-4 text-sm">
                <span className={getIntentColor('benevolent')}>● Benevolent - Helpful</span>
                <span className={getIntentColor('malevolent')}>● Malevolent - Harmful</span>
                <span className={getIntentColor('neutral')}>● Neutral - Unpredictable</span>
                <span className={getIntentColor('trickster')}>● Trickster - Mischievous</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default EntityEncyclopedia;
