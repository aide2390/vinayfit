import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Modal,
  TextInput,
  Image,
  Dimensions,
  Alert,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowLeft, Plus, X, Camera, Image as ImageIcon, Grid3x3 as Grid3X3, List, Calendar, Weight, Percent, MoveHorizontal as MoreHorizontal, TrendingUp, Eye, Download, Share, Filter, Search, ChevronDown, Tag } from 'lucide-react-native';
import { useColorScheme, getColors } from '@/hooks/useColorScheme';
import { CameraView, CameraType, useCameraPermissions } from 'expo-camera';
import { router } from 'expo-router';

const { width, height } = Dimensions.get('window');

interface ProgressPhoto {
  id: string;
  imageUri: string;
  weight?: number;
  bodyFat?: number;
  muscleMass?: number;
  date: string;
  time: string;
  tags: string[];
  notes?: string;
  measurements?: {
    chest?: number;
    waist?: number;
    hips?: number;
    arms?: number;
    thighs?: number;
  };
  pose: 'front' | 'side' | 'back' | 'custom';
}

interface PhotoComparison {
  before: ProgressPhoto;
  after: ProgressPhoto;
  daysDifference: number;
  weightChange?: number;
  bodyFatChange?: number;
}

const POSE_OPTIONS = [
  { id: 'front', label: 'Front View', emoji: '🧍‍♂️' },
  { id: 'side', label: 'Side View', emoji: '🚶‍♂️' },
  { id: 'back', label: 'Back View', emoji: '🧍‍♀️' },
  { id: 'custom', label: 'Custom', emoji: '📸' },
];

const FILTER_OPTIONS = [
  { id: 'all', label: 'All Photos' },
  { id: 'thisWeek', label: 'This Week' },
  { id: 'thisMonth', label: 'This Month' },
  { id: 'last3Months', label: 'Last 3 Months' },
  { id: 'front', label: 'Front View' },
  { id: 'side', label: 'Side View' },
  { id: 'back', label: 'Back View' },
];

export default function ProgressPhotoScreen() {
  const colorScheme = useColorScheme();
  const colors = getColors(colorScheme);
  const styles = createStyles(colors);

  const [photos, setPhotos] = useState<ProgressPhoto[]>([
    {
      id: '1',
      imageUri: 'https://images.pexels.com/photos/1043471/pexels-photo-1043471.jpeg',
      weight: 69.5,
      bodyFat: 15,
      muscleMass: 45.2,
      date: '2025-06-03',
      time: '08:30',
      tags: ['morning', 'fasted'],
      notes: 'Starting my fitness journey!',
      measurements: {
        chest: 95,
        waist: 82,
        arms: 32,
      },
      pose: 'front'
    },
    {
      id: '2',
      imageUri: 'https://images.pexels.com/photos/1552242/pexels-photo-1552242.jpeg',
      weight: 68.8,
      bodyFat: 14.2,
      muscleMass: 45.8,
      date: '2025-05-20',
      time: '09:15',
      tags: ['progress', 'side'],
      pose: 'side'
    },
    {
      id: '3',
      imageUri: 'https://images.pexels.com/photos/3822356/pexels-photo-3822356.jpeg',
      weight: 70.2,
      bodyFat: 16.1,
      muscleMass: 44.5,
      date: '2025-05-06',
      time: '07:45',
      tags: ['baseline'],
      pose: 'back'
    }
  ]);

  const [viewMode, setViewMode] = useState<'grid' | 'list' | 'comparison'>('grid');
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showPhotoModal, setShowPhotoModal] = useState(false);
  const [showCameraModal, setShowCameraModal] = useState(false);
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [showComparisonModal, setShowComparisonModal] = useState(false);
  const [selectedPhoto, setSelectedPhoto] = useState<ProgressPhoto | null>(null);
  const [comparisonPhotos, setComparisonPhotos] = useState<{ before: ProgressPhoto | null; after: ProgressPhoto | null }>({
    before: null,
    after: null
  });
  
  // Form states
  const [newPhoto, setNewPhoto] = useState<Partial<ProgressPhoto>>({
    weight: undefined,
    bodyFat: undefined,
    muscleMass: undefined,
    date: new Date().toISOString().split('T')[0],
    time: new Date().toTimeString().slice(0, 5),
    tags: [],
    pose: 'front',
    measurements: {}
  });
  const [tempImageUri, setTempImageUri] = useState<string>('');
  const [newTag, setNewTag] = useState('');

  // Camera states
  const [facing, setFacing] = useState<CameraType>('back');
  const [permission, requestPermission] = useCameraPermissions();
  const cameraRef = useRef<CameraView>(null);

  const filteredPhotos = photos.filter(photo => {
    // Filter by search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      const matchesSearch = 
        photo.tags.some(tag => tag.toLowerCase().includes(query)) ||
        photo.notes?.toLowerCase().includes(query) ||
        photo.pose.toLowerCase().includes(query);
      if (!matchesSearch) return false;
    }

    // Filter by selected filter
    if (selectedFilter === 'all') return true;
    
    const photoDate = new Date(photo.date);
    const now = new Date();
    
    switch (selectedFilter) {
      case 'thisWeek':
        const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        return photoDate >= weekAgo;
      case 'thisMonth':
        const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        return photoDate >= monthAgo;
      case 'last3Months':
        const threeMonthsAgo = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
        return photoDate >= threeMonthsAgo;
      case 'front':
      case 'side':
      case 'back':
        return photo.pose === selectedFilter;
      default:
        return true;
    }
  });

  const handleAddPhoto = () => {
    setShowAddModal(true);
  };

  const handleTakePhoto = async () => {
    if (Platform.OS === 'web') {
      setTempImageUri('https://images.pexels.com/photos/1043471/pexels-photo-1043471.jpeg');
      setShowCameraModal(false);
      setShowPhotoModal(true);
    } else {
      if (!permission?.granted) {
        const result = await requestPermission();
        if (!result.granted) {
          Alert.alert('Permission required', 'Camera permission is needed to take photos');
          return;
        }
      }
      setShowCameraModal(true);
    }
  };

  const handleOpenAlbum = () => {
    setTempImageUri('https://images.pexels.com/photos/1552242/pexels-photo-1552242.jpeg');
    setShowAddModal(false);
    setShowPhotoModal(true);
  };

  const capturePhoto = async () => {
    if (cameraRef.current) {
      try {
        const photo = await cameraRef.current.takePictureAsync();
        if (photo) {
          setTempImageUri(photo.uri);
          setShowCameraModal(false);
          setShowPhotoModal(true);
        }
      } catch (error) {
        Alert.alert('Error', 'Failed to take photo');
      }
    }
  };

  const handleSavePhoto = () => {
    if (!tempImageUri) return;

    const newPhotoData: ProgressPhoto = {
      id: Date.now().toString(),
      imageUri: tempImageUri,
      weight: newPhoto.weight,
      bodyFat: newPhoto.bodyFat,
      muscleMass: newPhoto.muscleMass,
      date: newPhoto.date || new Date().toISOString().split('T')[0],
      time: newPhoto.time || new Date().toTimeString().slice(0, 5),
      tags: newPhoto.tags || [],
      notes: newPhoto.notes,
      measurements: newPhoto.measurements || {},
      pose: newPhoto.pose || 'front'
    };

    setPhotos(prev => [newPhotoData, ...prev]);
    
    // Reset form
    setNewPhoto({
      weight: undefined,
      bodyFat: undefined,
      muscleMass: undefined,
      date: new Date().toISOString().split('T')[0],
      time: new Date().toTimeString().slice(0, 5),
      tags: [],
      pose: 'front',
      measurements: {}
    });
    setTempImageUri('');
    setShowPhotoModal(false);
  };

  const handleAddTag = () => {
    if (newTag.trim() && newPhoto.tags && !newPhoto.tags.includes(newTag.trim())) {
      setNewPhoto(prev => ({
        ...prev,
        tags: [...(prev.tags || []), newTag.trim()]
      }));
      setNewTag('');
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setNewPhoto(prev => ({
      ...prev,
      tags: prev.tags?.filter(tag => tag !== tagToRemove) || []
    }));
  };

  const handleComparePhotos = () => {
    if (comparisonPhotos.before && comparisonPhotos.after) {
      setShowComparisonModal(true);
    } else {
      Alert.alert('Select Photos', 'Please select two photos to compare');
    }
  };

  const calculateProgress = (): PhotoComparison | null => {
    if (!comparisonPhotos.before || !comparisonPhotos.after) return null;

    const beforeDate = new Date(comparisonPhotos.before.date);
    const afterDate = new Date(comparisonPhotos.after.date);
    const daysDifference = Math.abs((afterDate.getTime() - beforeDate.getTime()) / (1000 * 60 * 60 * 24));

    return {
      before: comparisonPhotos.before,
      after: comparisonPhotos.after,
      daysDifference: Math.round(daysDifference),
      weightChange: comparisonPhotos.after.weight && comparisonPhotos.before.weight 
        ? comparisonPhotos.after.weight - comparisonPhotos.before.weight 
        : undefined,
      bodyFatChange: comparisonPhotos.after.bodyFat && comparisonPhotos.before.bodyFat 
        ? comparisonPhotos.after.bodyFat - comparisonPhotos.before.bodyFat 
        : undefined,
    };
  };

  const renderGridView = () => (
    <View style={styles.gridContainer}>
      {filteredPhotos.map((photo, index) => (
        <TouchableOpacity
          key={photo.id}
          style={styles.gridItem}
          onPress={() => setSelectedPhoto(photo)}
          onLongPress={() => {
            if (!comparisonPhotos.before) {
              setComparisonPhotos(prev => ({ ...prev, before: photo }));
            } else if (!comparisonPhotos.after && photo.id !== comparisonPhotos.before.id) {
              setComparisonPhotos(prev => ({ ...prev, after: photo }));
            }
          }}
        >
          <Image source={{ uri: photo.imageUri }} style={styles.gridImage} />
          <View style={styles.gridOverlay}>
            <Text style={styles.gridDate}>
              {new Date(photo.date).toLocaleDateString('en-US', { 
                month: 'short', 
                day: 'numeric' 
              })}
            </Text>
            <View style={styles.gridPose}>
              <Text style={styles.gridPoseText}>{photo.pose.toUpperCase()}</Text>
            </View>
          </View>
          {(comparisonPhotos.before?.id === photo.id || comparisonPhotos.after?.id === photo.id) && (
            <View style={styles.selectedIndicator}>
              <Text style={styles.selectedText}>
                {comparisonPhotos.before?.id === photo.id ? '1' : '2'}
              </Text>
            </View>
          )}
        </TouchableOpacity>
      ))}
    </View>
  );

  const renderListView = () => (
    <View style={styles.listContainer}>
      {filteredPhotos.map((photo) => (
        <TouchableOpacity
          key={photo.id}
          style={styles.listItem}
          onPress={() => setSelectedPhoto(photo)}
        >
          <Image source={{ uri: photo.imageUri }} style={styles.listImage} />
          <View style={styles.listContent}>
            <View style={styles.listHeader}>
              <Text style={styles.listDate}>
                {new Date(photo.date).toLocaleDateString('en-US', { 
                  weekday: 'short',
                  month: 'short',
                  day: 'numeric'
                })}
              </Text>
              <Text style={styles.listTime}>{photo.time}</Text>
            </View>
            <View style={styles.listMetrics}>
              {photo.weight && (
                <Text style={styles.listMetric}>Weight: {photo.weight} kg</Text>
              )}
              {photo.bodyFat && (
                <Text style={styles.listMetric}>Body Fat: {photo.bodyFat}%</Text>
              )}
              {photo.muscleMass && (
                <Text style={styles.listMetric}>Muscle: {photo.muscleMass} kg</Text>
              )}
            </View>
            {photo.tags.length > 0 && (
              <View style={styles.tagContainer}>
                {photo.tags.slice(0, 3).map((tag, index) => (
                  <View key={index} style={styles.tag}>
                    <Text style={styles.tagText}>{tag}</Text>
                  </View>
                ))}
                {photo.tags.length > 3 && (
                  <Text style={styles.moreTagsText}>+{photo.tags.length - 3}</Text>
                )}
              </View>
            )}
          </View>
          <View style={styles.listActions}>
            <TouchableOpacity style={styles.listActionButton}>
              <Eye size={16} color={colors.textSecondary} />
            </TouchableOpacity>
            <TouchableOpacity style={styles.listActionButton}>
              <Share size={16} color={colors.textSecondary} />
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      ))}
    </View>
  );

  const renderComparisonView = () => {
    const progress = calculateProgress();
    
    return (
      <View style={styles.comparisonContainer}>
        <View style={styles.comparisonHeader}>
          <Text style={styles.comparisonTitle}>Photo Comparison</Text>
          {progress && (
            <Text style={styles.comparisonSubtitle}>
              {progress.daysDifference} days progress
            </Text>
          )}
        </View>

        <View style={styles.comparisonPhotos}>
          <View style={styles.comparisonPhotoContainer}>
            <Text style={styles.comparisonLabel}>Before</Text>
            {comparisonPhotos.before ? (
              <Image 
                source={{ uri: comparisonPhotos.before.imageUri }} 
                style={styles.comparisonImage} 
              />
            ) : (
              <TouchableOpacity 
                style={styles.comparisonPlaceholder}
                onPress={() => Alert.alert('Select Photo', 'Long press on a photo in grid view to select')}
              >
                <Plus size={32} color={colors.textTertiary} />
                <Text style={styles.placeholderText}>Select Before</Text>
              </TouchableOpacity>
            )}
          </View>

          <View style={styles.comparisonPhotoContainer}>
            <Text style={styles.comparisonLabel}>After</Text>
            {comparisonPhotos.after ? (
              <Image 
                source={{ uri: comparisonPhotos.after.imageUri }} 
                style={styles.comparisonImage} 
              />
            ) : (
              <TouchableOpacity 
                style={styles.comparisonPlaceholder}
                onPress={() => Alert.alert('Select Photo', 'Long press on a photo in grid view to select')}
              >
                <Plus size={32} color={colors.textTertiary} />
                <Text style={styles.placeholderText}>Select After</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>

        {progress && (
          <View style={styles.progressStats}>
            <Text style={styles.progressTitle}>Progress Summary</Text>
            
            <View style={styles.progressGrid}>
              {progress.weightChange !== undefined && (
                <View style={styles.progressItem}>
                  <Text style={styles.progressValue}>
                    {progress.weightChange > 0 ? '+' : ''}{progress.weightChange.toFixed(1)} kg
                  </Text>
                  <Text style={styles.progressLabel}>Weight Change</Text>
                </View>
              )}
              
              {progress.bodyFatChange !== undefined && (
                <View style={styles.progressItem}>
                  <Text style={styles.progressValue}>
                    {progress.bodyFatChange > 0 ? '+' : ''}{progress.bodyFatChange.toFixed(1)}%
                  </Text>
                  <Text style={styles.progressLabel}>Body Fat Change</Text>
                </View>
              )}
              
              <View style={styles.progressItem}>
                <Text style={styles.progressValue}>{progress.daysDifference}</Text>
                <Text style={styles.progressLabel}>Days</Text>
              </View>
            </View>
          </View>
        )}

        <View style={styles.comparisonActions}>
          <TouchableOpacity 
            style={styles.clearButton}
            onPress={() => setComparisonPhotos({ before: null, after: null })}
          >
            <Text style={styles.clearButtonText}>Clear Selection</Text>
          </TouchableOpacity>
          
          {progress && (
            <TouchableOpacity style={styles.shareButton}>
              <Share size={16} color="#FFFFFF" />
              <Text style={styles.shareButtonText}>Share Progress</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <ArrowLeft size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={styles.title}>Progress Photos</Text>
        <TouchableOpacity onPress={handleAddPhoto} style={styles.addButton}>
          <Plus size={20} color={colors.primary} />
        </TouchableOpacity>
      </View>

      {/* Search and Filter */}
      <View style={styles.searchContainer}>
        <View style={styles.searchInputContainer}>
          <Search size={16} color={colors.textTertiary} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search by tags, notes..."
            placeholderTextColor={colors.textTertiary}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>
        <TouchableOpacity 
          style={styles.filterButton}
          onPress={() => setShowFilterModal(true)}
        >
          <Filter size={16} color={colors.textSecondary} />
        </TouchableOpacity>
      </View>

      {/* View Toggle */}
      <View style={styles.viewToggle}>
        <TouchableOpacity
          style={[styles.toggleButton, viewMode === 'grid' && styles.activeToggle]}
          onPress={() => setViewMode('grid')}
        >
          <Grid3X3 size={16} color={viewMode === 'grid' ? colors.surface : colors.textSecondary} />
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.toggleButton, viewMode === 'list' && styles.activeToggle]}
          onPress={() => setViewMode('list')}
        >
          <List size={16} color={viewMode === 'list' ? colors.surface : colors.textSecondary} />
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.toggleButton, viewMode === 'comparison' && styles.activeToggle]}
          onPress={() => setViewMode('comparison')}
        >
          <TrendingUp size={16} color={viewMode === 'comparison' ? colors.surface : colors.textSecondary} />
        </TouchableOpacity>
      </View>

      {/* Content */}
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {viewMode === 'grid' && renderGridView()}
        {viewMode === 'list' && renderListView()}
        {viewMode === 'comparison' && renderComparisonView()}
        <View style={{ height: 100 }} />
      </ScrollView>

      {/* Add Photo Modal */}
      <Modal
        visible={showAddModal}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowAddModal(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalHandle} />
          <Text style={styles.modalTitle}>Add Progress Photo</Text>
          <Text style={styles.modalSubtitle}>Choose how to add your photo</Text>
          
          <View style={styles.modalButtons}>
            <TouchableOpacity style={styles.modalButton} onPress={handleTakePhoto}>
              <Camera size={24} color={colors.primary} />
              <Text style={styles.modalButtonText}>Take Photo</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.modalButton} onPress={handleOpenAlbum}>
              <ImageIcon size={24} color={colors.primary} />
              <Text style={styles.modalButtonText}>Choose from Gallery</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Filter Modal */}
      <Modal
        visible={showFilterModal}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowFilterModal(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalHandle} />
          <Text style={styles.modalTitle}>Filter Photos</Text>
          
          <View style={styles.filterOptions}>
            {FILTER_OPTIONS.map((option) => (
              <TouchableOpacity
                key={option.id}
                style={[
                  styles.filterOption,
                  selectedFilter === option.id && styles.selectedFilterOption
                ]}
                onPress={() => {
                  setSelectedFilter(option.id);
                  setShowFilterModal(false);
                }}
              >
                <Text style={[
                  styles.filterOptionText,
                  selectedFilter === option.id && styles.selectedFilterOptionText
                ]}>
                  {option.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </Modal>

      {/* Camera Modal */}
      <Modal
        visible={showCameraModal}
        animationType="slide"
        onRequestClose={() => setShowCameraModal(false)}
      >
        <View style={styles.cameraContainer}>
          {permission?.granted ? (
            <CameraView
              ref={cameraRef}
              style={styles.camera}
              facing={facing}
            >
              <View style={styles.cameraControls}>
                <TouchableOpacity
                  style={styles.cameraButton}
                  onPress={() => setShowCameraModal(false)}
                >
                  <X size={24} color="#FFFFFF" />
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.captureButton}
                  onPress={capturePhoto}
                />
                <TouchableOpacity
                  style={styles.cameraButton}
                  onPress={() => setFacing(current => current === 'back' ? 'front' : 'back')}
                >
                  <Camera size={24} color="#FFFFFF" />
                </TouchableOpacity>
              </View>
            </CameraView>
          ) : (
            <View style={styles.permissionContainer}>
              <Text style={styles.permissionText}>Camera permission required</Text>
              <TouchableOpacity style={styles.permissionButton} onPress={requestPermission}>
                <Text style={styles.permissionButtonText}>Grant Permission</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </Modal>

      {/* Photo Details Modal */}
      <Modal
        visible={showPhotoModal}
        animationType="slide"
        onRequestClose={() => setShowPhotoModal(false)}
      >
        <SafeAreaView style={styles.photoModalContainer}>
          <View style={styles.photoModalHeader}>
            <TouchableOpacity onPress={() => setShowPhotoModal(false)}>
              <ArrowLeft size={24} color={colors.text} />
            </TouchableOpacity>
            <Text style={styles.photoModalTitle}>Add Details</Text>
            <TouchableOpacity onPress={handleSavePhoto} style={styles.saveHeaderButton}>
              <Text style={styles.saveHeaderButtonText}>Save</Text>
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.photoModalContent}>
            {/* Photo Preview */}
            <View style={styles.photoPreview}>
              <Image source={{ uri: tempImageUri }} style={styles.previewImage} />
            </View>

            {/* Form Fields */}
            <View style={styles.formContainer}>
              {/* Pose Selection */}
              <View style={styles.formField}>
                <Text style={styles.fieldLabel}>Pose</Text>
                <View style={styles.poseOptions}>
                  {POSE_OPTIONS.map((pose) => (
                    <TouchableOpacity
                      key={pose.id}
                      style={[
                        styles.poseOption,
                        newPhoto.pose === pose.id && styles.selectedPoseOption
                      ]}
                      onPress={() => setNewPhoto(prev => ({ ...prev, pose: pose.id as any }))}
                    >
                      <Text style={styles.poseEmoji}>{pose.emoji}</Text>
                      <Text style={[
                        styles.poseLabel,
                        newPhoto.pose === pose.id && styles.selectedPoseLabel
                      ]}>
                        {pose.label}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              {/* Metrics */}
              <View style={styles.metricsGrid}>
                <View style={styles.metricField}>
                  <Text style={styles.fieldLabel}>Weight (kg)</Text>
                  <TextInput
                    style={styles.metricInput}
                    value={newPhoto.weight?.toString() || ''}
                    onChangeText={(text) => setNewPhoto(prev => ({ ...prev, weight: parseFloat(text) || undefined }))}
                    placeholder="0.0"
                    placeholderTextColor={colors.textTertiary}
                    keyboardType="numeric"
                  />
                </View>

                <View style={styles.metricField}>
                  <Text style={styles.fieldLabel}>Body Fat (%)</Text>
                  <TextInput
                    style={styles.metricInput}
                    value={newPhoto.bodyFat?.toString() || ''}
                    onChangeText={(text) => setNewPhoto(prev => ({ ...prev, bodyFat: parseFloat(text) || undefined }))}
                    placeholder="0.0"
                    placeholderTextColor={colors.textTertiary}
                    keyboardType="numeric"
                  />
                </View>

                <View style={styles.metricField}>
                  <Text style={styles.fieldLabel}>Muscle Mass (kg)</Text>
                  <TextInput
                    style={styles.metricInput}
                    value={newPhoto.muscleMass?.toString() || ''}
                    onChangeText={(text) => setNewPhoto(prev => ({ ...prev, muscleMass: parseFloat(text) || undefined }))}
                    placeholder="0.0"
                    placeholderTextColor={colors.textTertiary}
                    keyboardType="numeric"
                  />
                </View>
              </View>

              {/* Date and Time */}
              <View style={styles.dateTimeRow}>
                <View style={styles.dateTimeField}>
                  <Text style={styles.fieldLabel}>Date</Text>
                  <TextInput
                    style={styles.dateTimeInput}
                    value={newPhoto.date || ''}
                    onChangeText={(text) => setNewPhoto(prev => ({ ...prev, date: text }))}
                    placeholder="YYYY-MM-DD"
                    placeholderTextColor={colors.textTertiary}
                  />
                </View>

                <View style={styles.dateTimeField}>
                  <Text style={styles.fieldLabel}>Time</Text>
                  <TextInput
                    style={styles.dateTimeInput}
                    value={newPhoto.time || ''}
                    onChangeText={(text) => setNewPhoto(prev => ({ ...prev, time: text }))}
                    placeholder="HH:MM"
                    placeholderTextColor={colors.textTertiary}
                  />
                </View>
              </View>

              {/* Tags */}
              <View style={styles.formField}>
                <Text style={styles.fieldLabel}>Tags</Text>
                <View style={styles.tagInputContainer}>
                  <TextInput
                    style={styles.tagInput}
                    value={newTag}
                    onChangeText={setNewTag}
                    placeholder="Add tag..."
                    placeholderTextColor={colors.textTertiary}
                    onSubmitEditing={handleAddTag}
                  />
                  <TouchableOpacity style={styles.addTagButton} onPress={handleAddTag}>
                    <Plus size={16} color={colors.primary} />
                  </TouchableOpacity>
                </View>
                
                {newPhoto.tags && newPhoto.tags.length > 0 && (
                  <View style={styles.tagContainer}>
                    {newPhoto.tags.map((tag, index) => (
                      <TouchableOpacity
                        key={index}
                        style={styles.editableTag}
                        onPress={() => handleRemoveTag(tag)}
                      >
                        <Text style={styles.editableTagText}>{tag}</Text>
                        <X size={12} color={colors.primary} />
                      </TouchableOpacity>
                    ))}
                  </View>
                )}
              </View>

              {/* Notes */}
              <View style={styles.formField}>
                <Text style={styles.fieldLabel}>Notes</Text>
                <TextInput
                  style={styles.notesInput}
                  value={newPhoto.notes || ''}
                  onChangeText={(text) => setNewPhoto(prev => ({ ...prev, notes: text }))}
                  placeholder="Add notes about this photo..."
                  placeholderTextColor={colors.textTertiary}
                  multiline
                  numberOfLines={3}
                />
              </View>
            </View>
          </ScrollView>
        </SafeAreaView>
      </Modal>

      {/* Photo Detail View Modal */}
      <Modal
        visible={!!selectedPhoto}
        animationType="slide"
        onRequestClose={() => setSelectedPhoto(null)}
      >
        {selectedPhoto && (
          <SafeAreaView style={styles.detailModalContainer}>
            <View style={styles.detailHeader}>
              <TouchableOpacity onPress={() => setSelectedPhoto(null)}>
                <ArrowLeft size={24} color={colors.text} />
              </TouchableOpacity>
              <Text style={styles.detailTitle}>Photo Details</Text>
              <TouchableOpacity>
                <MoreHorizontal size={24} color={colors.text} />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.detailContent}>
              <Image source={{ uri: selectedPhoto.imageUri }} style={styles.detailImage} />
              
              <View style={styles.detailInfo}>
                <View style={styles.detailDateRow}>
                  <Text style={styles.detailDate}>
                    {new Date(selectedPhoto.date).toLocaleDateString('en-US', {
                      weekday: 'long',
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </Text>
                  <Text style={styles.detailTime}>{selectedPhoto.time}</Text>
                </View>
                
                <View style={styles.detailPose}>
                  <Text style={styles.detailPoseText}>{selectedPhoto.pose.toUpperCase()} VIEW</Text>
                </View>

                {(selectedPhoto.weight || selectedPhoto.bodyFat || selectedPhoto.muscleMass) && (
                  <View style={styles.detailMetrics}>
                    {selectedPhoto.weight && (
                      <View style={styles.detailMetric}>
                        <Weight size={16} color={colors.textSecondary} />
                        <Text style={styles.detailMetricText}>{selectedPhoto.weight} kg</Text>
                      </View>
                    )}
                    {selectedPhoto.bodyFat && (
                      <View style={styles.detailMetric}>
                        <Percent size={16} color={colors.textSecondary} />
                        <Text style={styles.detailMetricText}>{selectedPhoto.bodyFat}%</Text>
                      </View>
                    )}
                    {selectedPhoto.muscleMass && (
                      <View style={styles.detailMetric}>
                        <TrendingUp size={16} color={colors.textSecondary} />
                        <Text style={styles.detailMetricText}>{selectedPhoto.muscleMass} kg muscle</Text>
                      </View>
                    )}
                  </View>
                )}

                {selectedPhoto.tags.length > 0 && (
                  <View style={styles.detailTags}>
                    {selectedPhoto.tags.map((tag, index) => (
                      <View key={index} style={styles.detailTag}>
                        <Tag size={12} color={colors.primary} />
                        <Text style={styles.detailTagText}>{tag}</Text>
                      </View>
                    ))}
                  </View>
                )}

                {selectedPhoto.notes && (
                  <View style={styles.detailNotes}>
                    <Text style={styles.detailNotesTitle}>Notes</Text>
                    <Text style={styles.detailNotesText}>{selectedPhoto.notes}</Text>
                  </View>
                )}
              </View>
            </ScrollView>

            <View style={styles.detailActions}>
              <TouchableOpacity style={styles.detailActionButton}>
                <Share size={20} color={colors.primary} />
                <Text style={styles.detailActionText}>Share</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.detailActionButton}>
                <Download size={20} color={colors.primary} />
                <Text style={styles.detailActionText}>Download</Text>
              </TouchableOpacity>
            </View>
          </SafeAreaView>
        )}
      </Modal>
    </SafeAreaView>
  );
}

const createStyles = (colors: any) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  backButton: {
    padding: 4,
  },
  title: {
    fontFamily: 'Inter-Bold',
    fontSize: 18,
    color: colors.text,
    flex: 1,
    textAlign: 'center',
  },
  addButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.surfaceSecondary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
    gap: 12,
  },
  searchInputContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surfaceSecondary,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 8,
    gap: 8,
  },
  searchInput: {
    flex: 1,
    fontFamily: 'Inter-Regular',
    fontSize: 14,
    color: colors.text,
  },
  filterButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.surfaceSecondary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  viewToggle: {
    flexDirection: 'row',
    margin: 20,
    backgroundColor: colors.surfaceSecondary,
    borderRadius: 8,
    padding: 4,
  },
  toggleButton: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
    borderRadius: 6,
  },
  activeToggle: {
    backgroundColor: colors.primary,
  },
  content: {
    flex: 1,
  },
  gridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 16,
  },
  gridItem: {
    width: (width - 48) / 3,
    height: (width - 48) / 3,
    margin: 4,
    borderRadius: 8,
    overflow: 'hidden',
    position: 'relative',
  },
  gridImage: {
    width: '100%',
    height: '100%',
  },
  gridOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    padding: 6,
  },
  gridDate: {
    fontFamily: 'Inter-Medium',
    fontSize: 10,
    color: '#FFFFFF',
    marginBottom: 2,
  },
  gridPose: {
    alignSelf: 'flex-start',
  },
  gridPoseText: {
    fontFamily: 'Inter-Bold',
    fontSize: 8,
    color: '#FFFFFF',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 4,
    paddingVertical: 1,
    borderRadius: 2,
  },
  selectedIndicator: {
    position: 'absolute',
    top: 4,
    right: 4,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  selectedText: {
    fontFamily: 'Inter-Bold',
    fontSize: 10,
    color: '#FFFFFF',
  },
  listContainer: {
    paddingHorizontal: 20,
  },
  listItem: {
    flexDirection: 'row',
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 4,
    elevation: 2,
  },
  listImage: {
    width: 80,
    height: 80,
    borderRadius: 8,
    marginRight: 16,
  },
  listContent: {
    flex: 1,
  },
  listHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  listDate: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 16,
    color: colors.text,
  },
  listTime: {
    fontFamily: 'Inter-Regular',
    fontSize: 12,
    color: colors.textSecondary,
  },
  listMetrics: {
    marginBottom: 8,
  },
  listMetric: {
    fontFamily: 'Inter-Regular',
    fontSize: 12,
    color: colors.textSecondary,
    marginBottom: 2,
  },
  listActions: {
    justifyContent: 'space-between',
    alignItems: 'center',
    marginLeft: 12,
  },
  listActionButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.surfaceSecondary,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  tagContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 4,
  },
  tag: {
    backgroundColor: colors.primary + '20',
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  tagText: {
    fontFamily: 'Inter-Medium',
    fontSize: 10,
    color: colors.primary,
  },
  moreTagsText: {
    fontFamily: 'Inter-Medium',
    fontSize: 10,
    color: colors.textTertiary,
    alignSelf: 'center',
  },
  comparisonContainer: {
    paddingHorizontal: 20,
  },
  comparisonHeader: {
    alignItems: 'center',
    marginBottom: 24,
  },
  comparisonTitle: {
    fontFamily: 'Inter-Bold',
    fontSize: 20,
    color: colors.text,
    marginBottom: 4,
  },
  comparisonSubtitle: {
    fontFamily: 'Inter-Regular',
    fontSize: 14,
    color: colors.textSecondary,
  },
  comparisonPhotos: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 24,
  },
  comparisonPhotoContainer: {
    flex: 1,
    alignItems: 'center',
  },
  comparisonLabel: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 14,
    color: colors.text,
    marginBottom: 8,
  },
  comparisonImage: {
    width: '100%',
    height: 200,
    borderRadius: 12,
  },
  comparisonPlaceholder: {
    width: '100%',
    height: 200,
    borderRadius: 12,
    backgroundColor: colors.surfaceSecondary,
    borderWidth: 2,
    borderColor: colors.border,
    borderStyle: 'dashed',
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholderText: {
    fontFamily: 'Inter-Medium',
    fontSize: 12,
    color: colors.textTertiary,
    marginTop: 8,
  },
  progressStats: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: 20,
    marginBottom: 24,
  },
  progressTitle: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 16,
    color: colors.text,
    marginBottom: 16,
    textAlign: 'center',
  },
  progressGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  progressItem: {
    alignItems: 'center',
  },
  progressValue: {
    fontFamily: 'Inter-Bold',
    fontSize: 18,
    color: colors.primary,
    marginBottom: 4,
  },
  progressLabel: {
    fontFamily: 'Inter-Regular',
    fontSize: 12,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  comparisonActions: {
    flexDirection: 'row',
    gap: 12,
  },
  clearButton: {
    flex: 1,
    backgroundColor: colors.surfaceSecondary,
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: 'center',
  },
  clearButtonText: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 14,
    color: colors.text,
  },
  shareButton: {
    flex: 1,
    backgroundColor: colors.primary,
    borderRadius: 12,
    paddingVertical: 12,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
  },
  shareButtonText: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 14,
    color: '#FFFFFF',
  },
  modalContainer: {
    flex: 1,
    backgroundColor: colors.surface,
    paddingTop: 20,
    paddingHorizontal: 20,
  },
  modalHandle: {
    width: 40,
    height: 4,
    backgroundColor: colors.border,
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontFamily: 'Inter-Bold',
    fontSize: 20,
    color: colors.text,
    textAlign: 'center',
    marginBottom: 8,
  },
  modalSubtitle: {
    fontFamily: 'Inter-Regular',
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: 32,
  },
  modalButtons: {
    gap: 16,
  },
  modalButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surfaceSecondary,
    borderRadius: 12,
    paddingVertical: 16,
    gap: 12,
  },
  modalButtonText: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 16,
    color: colors.text,
  },
  filterOptions: {
    gap: 8,
  },
  filterOption: {
    backgroundColor: colors.surfaceSecondary,
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 20,
    alignItems: 'center',
  },
  selectedFilterOption: {
    backgroundColor: colors.primary,
  },
  filterOptionText: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 16,
    color: colors.text,
  },
  selectedFilterOptionText: {
    color: '#FFFFFF',
  },
  cameraContainer: {
    flex: 1,
    backgroundColor: '#000000',
  },
  camera: {
    flex: 1,
  },
  cameraControls: {
    position: 'absolute',
    bottom: 50,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  cameraButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  captureButton: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: '#FFFFFF',
    borderWidth: 4,
    borderColor: 'rgba(255, 255, 255, 0.5)',
  },
  permissionContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background,
  },
  permissionText: {
    fontFamily: 'Inter-Regular',
    fontSize: 16,
    color: colors.text,
    marginBottom: 20,
  },
  permissionButton: {
    backgroundColor: colors.primary,
    borderRadius: 8,
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  permissionButtonText: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 16,
    color: '#FFFFFF',
  },
  photoModalContainer: {
    flex: 1,
    backgroundColor: colors.background,
  },
  photoModalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  photoModalTitle: {
    fontFamily: 'Inter-Bold',
    fontSize: 18,
    color: colors.text,
  },
  saveHeaderButton: {
    backgroundColor: colors.primary,
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  saveHeaderButtonText: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 14,
    color: '#FFFFFF',
  },
  photoModalContent: {
    flex: 1,
  },
  photoPreview: {
    height: 250,
  },
  previewImage: {
    width: '100%',
    height: '100%',
  },
  formContainer: {
    padding: 20,
  },
  formField: {
    marginBottom: 20,
  },
  fieldLabel: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 14,
    color: colors.text,
    marginBottom: 8,
  },
  poseOptions: {
    flexDirection: 'row',
    gap: 8,
  },
  poseOption: {
    flex: 1,
    backgroundColor: colors.surfaceSecondary,
    borderRadius: 8,
    padding: 12,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  selectedPoseOption: {
    backgroundColor: colors.primary + '20',
    borderColor: colors.primary,
  },
  poseEmoji: {
    fontSize: 20,
    marginBottom: 4,
  },
  poseLabel: {
    fontFamily: 'Inter-Medium',
    fontSize: 10,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  selectedPoseLabel: {
    color: colors.primary,
  },
  metricsGrid: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 20,
  },
  metricField: {
    flex: 1,
  },
  metricInput: {
    fontFamily: 'Inter-Regular',
    fontSize: 14,
    color: colors.text,
    backgroundColor: colors.surfaceSecondary,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    textAlign: 'center',
  },
  dateTimeRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 20,
  },
  dateTimeField: {
    flex: 1,
  },
  dateTimeInput: {
    fontFamily: 'Inter-Regular',
    fontSize: 14,
    color: colors.text,
    backgroundColor: colors.surfaceSecondary,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  tagInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surfaceSecondary,
    borderRadius: 8,
    paddingHorizontal: 12,
    marginBottom: 12,
  },
  tagInput: {
    flex: 1,
    fontFamily: 'Inter-Regular',
    fontSize: 14,
    color: colors.text,
    paddingVertical: 10,
  },
  addTagButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.primary + '20',
    justifyContent: 'center',
    alignItems: 'center',
  },
  editableTag: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primary + '20',
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
    marginRight: 8,
    marginBottom: 4,
  },
  editableTagText: {
    fontFamily: 'Inter-Medium',
    fontSize: 12,
    color: colors.primary,
    marginRight: 4,
  },
  notesInput: {
    fontFamily: 'Inter-Regular',
    fontSize: 14,
    color: colors.text,
    backgroundColor: colors.surfaceSecondary,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    minHeight: 80,
    textAlignVertical: 'top',
  },
  detailModalContainer: {
    flex: 1,
    backgroundColor: colors.background,
  },
  detailHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  detailTitle: {
    fontFamily: 'Inter-Bold',
    fontSize: 18,
    color: colors.text,
  },
  detailContent: {
    flex: 1,
  },
  detailImage: {
    width: '100%',
    height: 400,
  },
  detailInfo: {
    padding: 20,
  },
  detailDateRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  detailDate: {
    fontFamily: 'Inter-Bold',
    fontSize: 18,
    color: colors.text,
  },
  detailTime: {
    fontFamily: 'Inter-Regular',
    fontSize: 14,
    color: colors.textSecondary,
  },
  detailPose: {
    alignSelf: 'flex-start',
    backgroundColor: colors.primary + '20',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginBottom: 16,
  },
  detailPoseText: {
    fontFamily: 'Inter-Bold',
    fontSize: 12,
    color: colors.primary,
  },
  detailMetrics: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
    marginBottom: 16,
  },
  detailMetric: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surfaceSecondary,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  detailMetricText: {
    fontFamily: 'Inter-Medium',
    fontSize: 14,
    color: colors.text,
    marginLeft: 8,
  },
  detailTags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 16,
  },
  detailTag: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primary + '20',
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
    gap: 4,
  },
  detailTagText: {
    fontFamily: 'Inter-Medium',
    fontSize: 12,
    color: colors.primary,
  },
  detailNotes: {
    backgroundColor: colors.surfaceSecondary,
    borderRadius: 12,
    padding: 16,
  },
  detailNotesTitle: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 14,
    color: colors.text,
    marginBottom: 8,
  },
  detailNotesText: {
    fontFamily: 'Inter-Regular',
    fontSize: 14,
    color: colors.textSecondary,
    lineHeight: 20,
  },
  detailActions: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    gap: 16,
  },
  detailActionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surfaceSecondary,
    borderRadius: 12,
    paddingVertical: 12,
    gap: 8,
  },
  detailActionText: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 14,
    color: colors.primary,
  },
});