import React, { useState } from 'react';
import {
    View,
    Text,
    ScrollView,
    TouchableOpacity,
    StyleSheet,
    TextInput,
    Alert,
    Modal,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

const COLORS = {
    walmartBlue: '#0071CE',
    walmartDarkBlue: '#004C91',
    white: '#FFFFFF',
    lightGray: '#F5F5F5',
    mediumGray: '#9E9E9E',
    darkGray: '#424242',
    textPrimary: '#212121',
    textSecondary: '#757575',
    success: '#388E3C',
    warning: '#F57C00',
    error: '#D32F2F',
    borderColor: '#E0E0E0',
};

// Mock shopping lists data
const initialLists = [
    {
        id: '1',
        name: 'Weekly Groceries',
        itemCount: 12,
        createdDate: '2024-01-15',
        lastModified: '2024-01-20',
        items: [
            { id: '1', name: 'Milk', completed: false },
            { id: '2', name: 'Bread', completed: true },
            { id: '3', name: 'Eggs', completed: false },
        ]
    },
    {
        id: '2',
        name: 'Birthday Party Supplies',
        itemCount: 8,
        createdDate: '2024-01-10',
        lastModified: '2024-01-18',
        items: [
            { id: '1', name: 'Balloons', completed: false },
            { id: '2', name: 'Cake Mix', completed: false },
        ]
    },
    {
        id: '3',
        name: 'Home Office Setup',
        itemCount: 5,
        createdDate: '2024-01-05',
        lastModified: '2024-01-16',
        items: [
            { id: '1', name: 'Desk Lamp', completed: true },
            { id: '2', name: 'Office Chair', completed: false },
        ]
    },
];

export default function ShoppingListsScreen() {
    const [lists, setLists] = useState(initialLists);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [newListName, setNewListName] = useState('');

    const handleCreateList = () => {
        if (newListName.trim()) {
            const newList = {
                id: Date.now().toString(),
                name: newListName.trim(),
                itemCount: 0,
                createdDate: new Date().toISOString().split('T')[0],
                lastModified: new Date().toISOString().split('T')[0],
                items: []
            };
            setLists([newList, ...lists]);
            setNewListName('');
            setShowCreateModal(false);
        }
    };

    const handleDeleteList = (listId: string) => {
        Alert.alert(
            'Delete List',
            'Are you sure you want to delete this shopping list?',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Delete',
                    style: 'destructive',
                    onPress: () => {
                        setLists(lists.filter(list => list.id !== listId));
                    },
                },
            ]
        );
    };

    const handleListPress = (listId: string) => {
        // TODO: Navigate to list details screen
        console.log('Open list:', listId);
    };

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric'
        });
    };

    const renderListItem = (list: any) => (
        <TouchableOpacity
            key={list.id}
            style={styles.listCard}
            onPress={() => handleListPress(list.id)}
        >
            <View style={styles.listHeader}>
                <View style={styles.listIconContainer}>
                    <Ionicons name="list" size={24} color={COLORS.walmartBlue} />
                </View>
                <View style={styles.listInfo}>
                    <Text style={styles.listName}>{list.name}</Text>
                    <Text style={styles.listDetails}>
                        {list.itemCount} items • Updated {formatDate(list.lastModified)}
                    </Text>
                </View>
                <TouchableOpacity
                    style={styles.deleteButton}
                    onPress={() => handleDeleteList(list.id)}
                >
                    <Ionicons name="trash-outline" size={20} color={COLORS.error} />
                </TouchableOpacity>
            </View>

            {/* Preview of list items */}
            {list.items.length > 0 && (
                <View style={styles.itemsPreview}>
                    {list.items.slice(0, 3).map((item: any, index: number) => (
                        <View key={item.id} style={styles.previewItem}>
                            <Ionicons
                                name={item.completed ? "checkmark-circle" : "ellipse-outline"}
                                size={16}
                                color={item.completed ? COLORS.success : COLORS.mediumGray}
                            />
                            <Text style={[
                                styles.previewItemText,
                                item.completed && styles.completedItemText
                            ]}>
                                {item.name}
                            </Text>
                        </View>
                    ))}
                    {list.items.length > 3 && (
                        <Text style={styles.moreItemsText}>
                            +{list.items.length - 3} more items
                        </Text>
                    )}
                </View>
            )}

            <View style={styles.listFooter}>
                <TouchableOpacity style={styles.listAction}>
                    <Ionicons name="add" size={16} color={COLORS.walmartBlue} />
                    <Text style={styles.listActionText}>Add Items</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.listAction}>
                    <Ionicons name="share-outline" size={16} color={COLORS.walmartBlue} />
                    <Text style={styles.listActionText}>Share</Text>
                </TouchableOpacity>
            </View>
        </TouchableOpacity>
    );

    return (
        <SafeAreaView style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity
                    onPress={() => router.back()}
                    style={styles.backButton}
                >
                    <Ionicons name="arrow-back" size={24} color={COLORS.textPrimary} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Shopping Lists</Text>
                <TouchableOpacity
                    style={styles.createButton}
                    onPress={() => setShowCreateModal(true)}
                >
                    <Ionicons name="add" size={24} color={COLORS.walmartBlue} />
                </TouchableOpacity>
            </View>

            <ScrollView style={styles.scrollContainer} showsVerticalScrollIndicator={false}>
                {/* Quick Actions */}
                <View style={styles.quickActions}>
                    <TouchableOpacity style={styles.quickAction}>
                        <Ionicons name="camera-outline" size={24} color={COLORS.walmartBlue} />
                        <Text style={styles.quickActionText}>Scan Receipt</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.quickAction}>
                        <Ionicons name="mic-outline" size={24} color={COLORS.walmartBlue} />
                        <Text style={styles.quickActionText}>Voice Add</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.quickAction}>
                        <Ionicons name="copy-outline" size={24} color={COLORS.walmartBlue} />
                        <Text style={styles.quickActionText}>Templates</Text>
                    </TouchableOpacity>
                </View>

                {/* Lists */}
                {lists.length > 0 ? (
                    <View style={styles.listsContainer}>
                        <Text style={styles.sectionTitle}>Your Lists ({lists.length})</Text>
                        {lists.map(renderListItem)}
                    </View>
                ) : (
                    <View style={styles.emptyState}>
                        <Ionicons name="list-outline" size={64} color={COLORS.mediumGray} />
                        <Text style={styles.emptyStateTitle}>No Shopping Lists Yet</Text>
                        <Text style={styles.emptyStateSubtitle}>
                            Create your first list to organize your shopping
                        </Text>
                        <TouchableOpacity
                            style={styles.createFirstListButton}
                            onPress={() => setShowCreateModal(true)}
                        >
                            <Text style={styles.createFirstListText}>Create Your First List</Text>
                        </TouchableOpacity>
                    </View>
                )}

                {/* Tips Section */}
                <View style={styles.tipsCard}>
                    <Text style={styles.tipsTitle}>💡 Pro Tips</Text>
                    <Text style={styles.tipItem}>• Share lists with family members</Text>
                    <Text style={styles.tipItem}>• Use voice commands to add items quickly</Text>
                    <Text style={styles.tipItem}>• Scan receipts to recreate past purchases</Text>
                    <Text style={styles.tipItem}>• Create templates for recurring shopping</Text>
                </View>
            </ScrollView>

            {/* Create List Modal */}
            <Modal
                visible={showCreateModal}
                transparent={true}
                animationType="slide"
                onRequestClose={() => setShowCreateModal(false)}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <View style={styles.modalHeader}>
                            <Text style={styles.modalTitle}>Create New List</Text>
                            <TouchableOpacity
                                onPress={() => setShowCreateModal(false)}
                                style={styles.modalCloseButton}
                            >
                                <Ionicons name="close" size={24} color={COLORS.textPrimary} />
                            </TouchableOpacity>
                        </View>

                        <View style={styles.modalBody}>
                            <Text style={styles.inputLabel}>List Name</Text>
                            <TextInput
                                style={styles.textInput}
                                placeholder="Enter list name..."
                                value={newListName}
                                onChangeText={setNewListName}
                                autoFocus={true}
                                maxLength={50}
                            />

                            <View style={styles.modalActions}>
                                <TouchableOpacity
                                    style={styles.cancelButton}
                                    onPress={() => setShowCreateModal(false)}
                                >
                                    <Text style={styles.cancelButtonText}>Cancel</Text>
                                </TouchableOpacity>
                                <TouchableOpacity
                                    style={[
                                        styles.createListButton,
                                        !newListName.trim() && styles.createListButtonDisabled
                                    ]}
                                    onPress={handleCreateList}
                                    disabled={!newListName.trim()}
                                >
                                    <Text style={styles.createListButtonText}>Create List</Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    </View>
                </View>
            </Modal>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.lightGray,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
        backgroundColor: COLORS.white,
        borderBottomWidth: 1,
        borderBottomColor: COLORS.borderColor,
    },
    backButton: {
        padding: 4,
    },
    headerTitle: {
        flex: 1,
        fontSize: 18,
        fontWeight: 'bold',
        color: COLORS.textPrimary,
        textAlign: 'center',
        marginHorizontal: 16,
    },
    createButton: {
        padding: 4,
    },
    scrollContainer: {
        flex: 1,
    },
    quickActions: {
        flexDirection: 'row',
        backgroundColor: COLORS.white,
        margin: 16,
        borderRadius: 12,
        padding: 16,
        justifyContent: 'space-around',
    },
    quickAction: {
        alignItems: 'center',
        flex: 1,
    },
    quickActionText: {
        color: COLORS.walmartBlue,
        fontSize: 12,
        fontWeight: '500',
        marginTop: 8,
        textAlign: 'center',
    },
    listsContainer: {
        paddingHorizontal: 16,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: COLORS.textPrimary,
        marginBottom: 16,
    },
    listCard: {
        backgroundColor: COLORS.white,
        borderRadius: 12,
        padding: 16,
        marginBottom: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
        elevation: 2,
    },
    listHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 12,
    },
    listIconContainer: {
        width: 40,
        height: 40,
        backgroundColor: '#E3F2FD',
        borderRadius: 20,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 12,
    },
    listInfo: {
        flex: 1,
    },
    listName: {
        fontSize: 16,
        fontWeight: 'bold',
        color: COLORS.textPrimary,
    },
    listDetails: {
        fontSize: 12,
        color: COLORS.textSecondary,
        marginTop: 2,
    },
    deleteButton: {
        padding: 8,
    },
    itemsPreview: {
        marginBottom: 12,
    },
    previewItem: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 4,
    },
    previewItemText: {
        fontSize: 14,
        color: COLORS.textSecondary,
        marginLeft: 8,
    },
    completedItemText: {
        textDecorationLine: 'line-through',
        color: COLORS.mediumGray,
    },
    moreItemsText: {
        fontSize: 12,
        color: COLORS.walmartBlue,
        fontWeight: '500',
        marginTop: 4,
        marginLeft: 24,
    },
    listFooter: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        borderTopWidth: 1,
        borderTopColor: COLORS.borderColor,
        paddingTop: 12,
    },
    listAction: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
        justifyContent: 'center',
    },
    listActionText: {
        color: COLORS.walmartBlue,
        fontSize: 14,
        fontWeight: '500',
        marginLeft: 4,
    },
    emptyState: {
        alignItems: 'center',
        padding: 40,
        backgroundColor: COLORS.white,
        margin: 16,
        borderRadius: 12,
    },
    emptyStateTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: COLORS.textPrimary,
        marginTop: 16,
        marginBottom: 8,
    },
    emptyStateSubtitle: {
        fontSize: 14,
        color: COLORS.textSecondary,
        textAlign: 'center',
        marginBottom: 24,
        lineHeight: 20,
    },
    createFirstListButton: {
        backgroundColor: COLORS.walmartBlue,
        paddingHorizontal: 24,
        paddingVertical: 12,
        borderRadius: 8,
    },
    createFirstListText: {
        color: COLORS.white,
        fontSize: 16,
        fontWeight: 'bold',
    },
    tipsCard: {
        backgroundColor: COLORS.white,
        margin: 16,
        borderRadius: 12,
        padding: 16,
    },
    tipsTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        color: COLORS.textPrimary,
        marginBottom: 12,
    },
    tipItem: {
        fontSize: 14,
        color: COLORS.textSecondary,
        marginBottom: 6,
        lineHeight: 18,
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'flex-end',
    },
    modalContent: {
        backgroundColor: COLORS.white,
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        paddingBottom: 34,
    },
    modalHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: 20,
        borderBottomWidth: 1,
        borderBottomColor: COLORS.borderColor,
    },
    modalTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: COLORS.textPrimary,
    },
    modalCloseButton: {
        padding: 4,
    },
    modalBody: {
        padding: 20,
    },
    inputLabel: {
        fontSize: 14,
        fontWeight: '500',
        color: COLORS.textPrimary,
        marginBottom: 8,
    },
    textInput: {
        borderWidth: 1,
        borderColor: COLORS.borderColor,
        borderRadius: 8,
        padding: 12,
        fontSize: 16,
        marginBottom: 24,
    },
    modalActions: {
        flexDirection: 'row',
        gap: 12,
    },
    cancelButton: {
        flex: 1,
        paddingVertical: 12,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: COLORS.borderColor,
        alignItems: 'center',
    },
    cancelButtonText: {
        color: COLORS.textPrimary,
        fontSize: 16,
        fontWeight: '500',
    },
    createListButton: {
        flex: 1,
        paddingVertical: 12,
        borderRadius: 8,
        backgroundColor: COLORS.walmartBlue,
        alignItems: 'center',
    },
    createListButtonDisabled: {
        backgroundColor: COLORS.mediumGray,
    },
    createListButtonText: {
        color: COLORS.white,
        fontSize: 16,
        fontWeight: 'bold',
    },
});