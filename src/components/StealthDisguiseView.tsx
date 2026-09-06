import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, FlatList, Alert } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import * as Haptics from 'expo-haptics';

interface NoteItem {
  id: string;
  title: string;
  category: string;
  date: string;
  content: string;
}

const INITIAL_NOTES: NoteItem[] = [
  {
    id: '1',
    title: 'Recette infusion thym & miel',
    category: 'Bien-être',
    date: 'Hier',
    content: 'Faire infuser 1 branche de thym bio dans 250ml d’eau bouillante pendant 7 min. Ajouter 1 c.à.c de miel.',
  },
  {
    id: '2',
    title: 'Idées lectures de la semaine',
    category: 'Lecture',
    date: '12 Mai',
    content: 'Terminer le chapitre 4 du roman. Noter les citations inspirantes sur le carnet.',
  },
  {
    id: '3',
    title: 'Plantes balcon à arroser',
    category: 'Maison',
    date: '10 Mai',
    content: 'Monstera et lavande : jeudi matin. Vérifier le terreau du basilic.',
  },
  {
    id: '4',
    title: 'Liste courses marché bio',
    category: 'Courses',
    date: '08 Mai',
    content: 'Avocats, citrons non traités, flocons d’avoine, graines de chia et chocolat 85%.',
  },
];

interface StealthDisguiseViewProps {
  onExitStealth: () => void;
}

export const StealthDisguiseView: React.FC<StealthDisguiseViewProps> = ({ onExitStealth }) => {
  const [notes, setNotes] = useState<NoteItem[]>(INITIAL_NOTES);
  const [search, setSearch] = useState('');
  const [newTitle, setNewTitle] = useState('');
  const [newContent, setNewContent] = useState('');
  const [isAdding, setIsAdding] = useState(false);

  const handleAddNote = () => {
    if (!newTitle.trim()) return;
    const item: NoteItem = {
      id: Date.now().toString(),
      title: newTitle.trim(),
      category: 'Personnel',
      date: 'Aujourd’hui',
      content: newContent.trim() || 'Note rapide.',
    };
    setNotes([item, ...notes]);
    setNewTitle('');
    setNewContent('');
    setIsAdding(false);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  };

  const handleLongPressLogo = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    Alert.alert(
      'Quitter le Mode Furtif ?',
      'Voulez-vous réintégrer votre sanctuaire intime CycleSereine ?',
      [
        { text: 'Rester ici', style: 'cancel' },
        {
          text: 'Déverrouiller CycleSereine',
          onPress: onExitStealth,
        },
      ]
    );
  };

  const filteredNotes = notes.filter((n) =>
    n.title.toLowerCase().includes(search.toLowerCase()) ||
    n.content.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <View style={styles.container}>
      {/* Disguised Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onLongPress={handleLongPressLogo}
          delayLongPress={600}
          activeOpacity={0.8}
          style={styles.logoRow}
        >
          <View style={styles.iconBox}>
            <Ionicons name="document-text" size={18} color="#2A9D8F" />
          </View>
          <View>
            <Text style={styles.appTitle}>Notes Botaniques</Text>
            <Text style={styles.appSubtitle}>Mes pense-bêtes du quotidien</Text>
          </View>
        </TouchableOpacity>

        {/* Discreet un-mask icon */}
        <TouchableOpacity
          style={styles.discreetExitBtn}
          onPress={handleLongPressLogo}
          activeOpacity={0.7}
        >
          <Ionicons name="eye-outline" size={16} color="#718096" />
        </TouchableOpacity>
      </View>

      {/* Disguised Search Input */}
      <View style={styles.searchBar}>
        <Ionicons name="search-outline" size={16} color="#A0AEC0" />
        <TextInput
          style={styles.searchInput}
          placeholder="Rechercher dans mes notes..."
          placeholderTextColor="#A0AEC0"
          value={search}
          onChangeText={setSearch}
        />
      </View>

      {/* Add note bar */}
      {isAdding ? (
        <View style={styles.addForm}>
          <TextInput
            style={styles.titleInput}
            placeholder="Titre de la note"
            placeholderTextColor="#A0AEC0"
            value={newTitle}
            onChangeText={setNewTitle}
          />
          <TextInput
            style={styles.contentInput}
            placeholder="Contenu..."
            placeholderTextColor="#A0AEC0"
            multiline
            value={newContent}
            onChangeText={setNewContent}
          />
          <View style={styles.formBtnRow}>
            <TouchableOpacity style={styles.cancelBtn} onPress={() => setIsAdding(false)}>
              <Text style={styles.cancelBtnText}>Annuler</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.saveNoteBtn} onPress={handleAddNote}>
              <Text style={styles.saveNoteBtnText}>Enregistrer</Text>
            </TouchableOpacity>
          </View>
        </View>
      ) : (
        <TouchableOpacity style={styles.newNotePrompt} onPress={() => setIsAdding(true)}>
          <Ionicons name="add" size={18} color="#2A9D8F" />
          <Text style={styles.newNotePromptText}>Nouvelle note...</Text>
        </TouchableOpacity>
      )}

      {/* Notes List */}
      <FlatList
        data={filteredNotes}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        renderItem={({ item }) => (
          <View style={styles.noteCard}>
            <View style={styles.noteHeader}>
              <Text style={styles.noteTitle}>{item.title}</Text>
              <Text style={styles.noteDate}>{item.date}</Text>
            </View>
            <Text style={styles.noteBody} numberOfLines={3}>
              {item.content}
            </Text>
            <View style={styles.categoryPill}>
              <Text style={styles.categoryText}>{item.category}</Text>
            </View>
          </View>
        )}
      />

      {/* Discreet bottom bar note */}
      <View style={styles.footerNote}>
        <Text style={styles.footerHint}>
          Astuce : Maintenez l'icône supérieure appuyée pour retourner à CycleSereine.
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
    paddingTop: 50,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingBottom: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  logoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  iconBox: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: '#E6FFFA',
    alignItems: 'center',
    justifyContent: 'center',
  },
  appTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#2D3748',
  },
  appSubtitle: {
    fontSize: 12,
    color: '#718096',
  },
  discreetExitBtn: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: '#EDF2F7',
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EDF2F7',
    marginHorizontal: 20,
    marginTop: 14,
    marginBottom: 10,
    paddingHorizontal: 12,
    paddingVertical: 9,
    borderRadius: 12,
    gap: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: '#2D3748',
  },
  newNotePrompt: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 20,
    marginBottom: 12,
    padding: 12,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderStyle: 'dashed',
    gap: 8,
  },
  newNotePromptText: {
    fontSize: 14,
    color: '#2A9D8F',
    fontWeight: '600',
  },
  addForm: {
    marginHorizontal: 20,
    marginBottom: 12,
    padding: 14,
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#CBD5E0',
  },
  titleInput: {
    fontSize: 15,
    fontWeight: '700',
    color: '#2D3748',
    marginBottom: 8,
  },
  contentInput: {
    fontSize: 13,
    color: '#4A5568',
    minHeight: 50,
  },
  formBtnRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 8,
    marginTop: 10,
  },
  cancelBtn: {
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  cancelBtnText: {
    color: '#718096',
    fontSize: 13,
  },
  saveNoteBtn: {
    backgroundColor: '#2A9D8F',
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 8,
  },
  saveNoteBtnText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '600',
  },
  listContent: {
    paddingHorizontal: 20,
    paddingBottom: 20,
    gap: 12,
  },
  noteCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  noteHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  noteTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#2D3748',
    flex: 1,
  },
  noteDate: {
    fontSize: 11,
    color: '#A0AEC0',
    marginLeft: 8,
  },
  noteBody: {
    fontSize: 13,
    color: '#4A5568',
    lineHeight: 18,
    marginBottom: 8,
  },
  categoryPill: {
    alignSelf: 'flex-start',
    backgroundColor: '#EDF2F7',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  categoryText: {
    fontSize: 11,
    color: '#4A5568',
    fontWeight: '600',
  },
  footerNote: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
  },
  footerHint: {
    fontSize: 11,
    color: '#718096',
    textAlign: 'center',
  },
});
