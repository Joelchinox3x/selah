import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Search, X, ChevronRight, Compass } from 'lucide-react-native';
import { Screen } from '@/src/components/ui/Screen';
import { searchVerses } from '@/src/services/db/bibleDb';
import { useSettingsStore } from '@/src/features/settings/store/useSettingsStore';
import { themes } from '@/src/theme/colors';
import { SearchResult } from '@/src/types/bible';
import { hapticLight, hapticSelection } from '@/src/services/haptics/hapticFeedback';

type Scope = 'all' | 'OT' | 'NT';

const SUGGESTED_TAGS = ['Paz', 'Corazón', 'Consuelo', 'Esperanza', 'Temor', 'Reposo'];

export default function SearchScreen() {
  const router = useRouter();
  const themeMode = useSettingsStore((s) => s.theme);
  const theme = themes[themeMode] || themes.sepia;

  const [query, setQuery] = useState('');
  const [scope, setScope] = useState<Scope>('all');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  // Debounced search
  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      setLoading(false);
      setHasSearched(false);
      return;
    }

    setLoading(true);
    setHasSearched(true);

    const timer = setTimeout(async () => {
      try {
        const found = await searchVerses(query, scope, 80);
        setResults(found);
      } catch (e) {
        console.warn('Search error:', e);
      } finally {
        setLoading(false);
      }
    }, 220);

    return () => clearTimeout(timer);
  }, [query, scope]);

  const handleSelectResult = (item: SearchResult) => {
    hapticSelection();
    router.push({
      pathname: `/reader/${item.book_id}/${item.chapter}`,
      params: { highlightVerse: String(item.verse) },
    } as any);
  };

  const handleSelectTag = (tag: string) => {
    hapticLight();
    setQuery(tag);
  };

  const renderResultItem = ({ item }: { item: SearchResult }) => (
    <TouchableOpacity
      style={[
        styles.resultCard,
        {
          backgroundColor: theme.cardBackground,
          borderColor: theme.borderSubtle,
        },
      ]}
      activeOpacity={0.7}
      onPress={() => handleSelectResult(item)}
    >
      <View style={styles.resultHeader}>
        <Text style={[styles.resultRef, { color: theme.accent }]}>
          {item.book_name} {item.chapter}:{item.verse}
        </Text>
        <ChevronRight size={16} color={theme.textMuted} />
      </View>
      <Text style={[styles.resultText, { color: theme.text }]} numberOfLines={3}>
        «{item.text}»
      </Text>
    </TouchableOpacity>
  );

  return (
    <Screen safeTop safeBottom style={{ backgroundColor: theme.background }}>
      {/* Top Search Input Bar */}
      <View style={[styles.header, { borderBottomColor: theme.borderSubtle }]}>
        <View
          style={[
            styles.inputBox,
            {
              backgroundColor: theme.cardBackground,
              borderColor: theme.border,
            },
          ]}
        >
          <Search size={18} color={theme.textMuted} />
          <TextInput
            style={[styles.input, { color: theme.text }]}
            placeholder="Buscar palabra o frase (ej. paz, consuelo)..."
            placeholderTextColor={theme.textMuted}
            value={query}
            onChangeText={setQuery}
            autoFocus
            clearButtonMode="while-editing"
          />
          {query.length > 0 && (
            <TouchableOpacity onPress={() => setQuery('')} style={styles.clearBtn}>
              <X size={16} color={theme.textMuted} />
            </TouchableOpacity>
          )}
        </View>

        <TouchableOpacity
          onPress={() => {
            hapticLight();
            router.back();
          }}
          style={styles.cancelBtn}
        >
          <Text style={[styles.cancelText, { color: theme.accent }]}>Cancelar</Text>
        </TouchableOpacity>
      </View>

      {/* Scope Filter Pills */}
      <View style={styles.scopeRow}>
        {(['all', 'OT', 'NT'] as Scope[]).map((sc) => {
          const isSelected = scope === sc;
          const labels: Record<Scope, string> = {
            all: 'Toda la Biblia',
            OT: 'Antiguo Testamento',
            NT: 'Nuevo Testamento',
          };
          return (
            <TouchableOpacity
              key={sc}
              style={[
                styles.scopePill,
                {
                  backgroundColor: isSelected
                    ? theme.accent
                    : theme.surfaceRaised,
                  borderColor: isSelected ? theme.accent : theme.borderSubtle,
                },
              ]}
              onPress={() => {
                hapticLight();
                setScope(sc);
              }}
            >
              <Text
                style={[
                  styles.scopePillText,
                  {
                    color: isSelected ? '#ffffff' : theme.textMuted,
                    fontWeight: isSelected ? '700' : '500',
                  },
                ]}
              >
                {labels[sc]}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Suggested Search Tags (if no query) */}
      {!query && (
        <View style={styles.suggestedContainer}>
          <View style={styles.suggestedTitleRow}>
            <Compass size={15} color={theme.textMuted} />
            <Text style={[styles.suggestedTitle, { color: theme.textMuted }]}>
              Búsquedas frecuentes
            </Text>
          </View>
          <View style={styles.tagsGrid}>
            {SUGGESTED_TAGS.map((t) => (
              <TouchableOpacity
                key={t}
                style={[
                  styles.tagPill,
                  {
                    backgroundColor: theme.cardBackground,
                    borderColor: theme.borderSubtle,
                  },
                ]}
                onPress={() => handleSelectTag(t)}
              >
                <Text style={[styles.tagText, { color: theme.text }]}>{t}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      )}

      {/* Status or Results Count */}
      {hasSearched && !loading && (
        <View style={styles.resultCountRow}>
          <Text style={[styles.resultCountText, { color: theme.textMuted }]}>
            {results.length === 80
              ? '80+ versículos encontrados'
              : `${results.length} versículos encontrados`}
          </Text>
        </View>
      )}

      {/* Loading or Results List */}
      {loading ? (
        <View style={styles.loadingBox}>
          <ActivityIndicator size="small" color={theme.accent} />
          <Text style={[styles.loadingText, { color: theme.textMuted }]}>
            Buscando en las Escrituras...
          </Text>
        </View>
      ) : (
        <FlatList
          data={results}
          keyExtractor={(item) => String(item.verse_id)}
          renderItem={renderResultItem}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            hasSearched && query.trim() ? (
              <View style={styles.emptyBox}>
                <Text style={[styles.emptyText, { color: theme.textMuted }]}>
                  No se encontraron versículos con «{query}». Prueba con otra palabra clave.
                </Text>
              </View>
            ) : null
          }
        />
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderBottomWidth: 1,
    gap: 12,
  },
  inputBox: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    height: 42,
    borderRadius: 14,
    borderWidth: 1,
    gap: 8,
  },
  input: {
    flex: 1,
    fontSize: 14,
  },
  clearBtn: {
    padding: 2,
  },
  cancelBtn: {
    paddingVertical: 6,
  },
  cancelText: {
    fontSize: 14,
    fontWeight: '600',
  },
  scopeRow: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 10,
    gap: 8,
  },
  scopePill: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    borderWidth: 1,
  },
  scopePillText: {
    fontSize: 12,
  },
  suggestedContainer: {
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  suggestedTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 12,
  },
  suggestedTitle: {
    fontSize: 13,
    fontWeight: '600',
  },
  tagsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  tagPill: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 14,
    borderWidth: 1,
  },
  tagText: {
    fontSize: 13,
    fontWeight: '500',
  },
  resultCountRow: {
    paddingHorizontal: 16,
    paddingVertical: 6,
  },
  resultCountText: {
    fontSize: 12,
  },
  listContent: {
    paddingHorizontal: 16,
    paddingTop: 6,
    paddingBottom: 40,
    gap: 10,
  },
  resultCard: {
    padding: 14,
    borderRadius: 14,
    borderWidth: 1,
  },
  resultHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  resultRef: {
    fontSize: 14,
    fontWeight: '700',
  },
  resultText: {
    fontSize: 14,
    lineHeight: 20,
    fontStyle: 'italic',
  },
  loadingBox: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
    gap: 10,
  },
  loadingText: {
    fontSize: 13,
  },
  emptyBox: {
    alignItems: 'center',
    paddingVertical: 60,
    paddingHorizontal: 24,
  },
  emptyText: {
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
  },
});
