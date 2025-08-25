import React, { useState } from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    ScrollView,
    Modal,
    TextInput,
    Animated,
    StyleSheet,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';

interface Review {
    id: string;
    userId: string;
    userName: string;
    userAvatar?: string;
    rating: number;
    title: string;
    comment: string;
    date: string;
    verified: boolean;
    helpful: number;
    images?: string[];
    pros?: string[];
    cons?: string[];
    wouldRecommend?: boolean;
    purchaseVerified?: boolean;
}

interface ReviewSummary {
    averageRating: number;
    totalReviews: number;
    ratingDistribution: {
        5: number;
        4: number;
        3: number;
        2: number;
        1: number;
    };
    recommendationPercentage: number;
}

interface ProductReviewsProps {
    reviews: Review[];
    summary: ReviewSummary;
    productId: string;
    canWriteReview?: boolean;
    showWriteReview?: boolean;
    maxDisplayedReviews?: number;
    onWriteReview?: (review: Partial<Review>) => void;
    onMarkHelpful?: (reviewId: string) => void;
    onReportReview?: (reviewId: string) => void;
    onSeeAllReviews?: () => void;
}

export default function ProductReviews({
                                           reviews,
                                           summary,
                                           productId,
                                           canWriteReview = true,
                                           showWriteReview = true,
                                           maxDisplayedReviews = 3,
                                           onWriteReview,
                                           onMarkHelpful,
                                           onReportReview,
                                           onSeeAllReviews,
                                       }: ProductReviewsProps): JSX.Element {
    const [showWriteModal, setShowWriteModal] = useState(false);
    const [newReview, setNewReview] = useState({
        rating: 5,
        title: '',
        comment: '',
        wouldRecommend: true,
    });
    const [expandedReviews, setExpandedReviews] = useState<Set<string>>(new Set());
    const [selectedFilter, setSelectedFilter] = useState<'all' | '5' | '4' | '3' | '2' | '1'>('all');

    const displayedReviews = reviews
        .filter(review => selectedFilter === 'all' || review.rating === parseInt(selectedFilter))
        .slice(0, maxDisplayedReviews);

    const toggleExpandReview = (reviewId: string) => {
        const newExpanded = new Set(expandedReviews);
        if (newExpanded.has(reviewId)) {
            newExpanded.delete(reviewId);
        } else {
            newExpanded.add(reviewId);
        }
        setExpandedReviews(newExpanded);
    };

    const handleWriteReview = () => {
        if (!newReview.title.trim() || !newReview.comment.trim()) return;

        onWriteReview?.({
            ...newReview,
            date: new Date().toISOString(),
        });

        setShowWriteModal(false);
        setNewReview({
            rating: 5,
            title: '',
            comment: '',
            wouldRecommend: true,
        });
    };

    const renderRatingStars = (rating: number, size: number = 16, interactive: boolean = false) => {
        return (
            <View style={styles.starsContainer}>
                {[1, 2, 3, 4, 5].map((star) => (
                    <TouchableOpacity
                        key={star}
                        disabled={!interactive}
                        onPress={() => interactive && setNewReview(prev => ({ ...prev, rating: star }))}
                    >
                        <Ionicons
                            name="star"
                            size={size}
                            color={star <= rating ? "#F59E0B" : "#E5E7EB"}
                            style={styles.starIcon}
                        />
                    </TouchableOpacity>
                ))}
            </View>
        );
    };

    const renderReviewSummary = () => (
        <View style={styles.summaryContainer}>
            <View style={styles.summaryHeader}>
                <View style={styles.ratingOverview}>
                    <Text style={styles.averageRating}>
                        {summary.averageRating.toFixed(1)}
                    </Text>
                    {renderRatingStars(summary.averageRating, 20)}
                    <Text style={styles.totalReviews}>
                        {summary.totalReviews} reviews
                    </Text>
                </View>

                <View style={styles.ratingDistribution}>
                    {[5, 4, 3, 2, 1].map((rating) => {
                        const count = summary.ratingDistribution[rating as keyof typeof summary.ratingDistribution];
                        const percentage = summary.totalReviews > 0 ? (count / summary.totalReviews) * 100 : 0;

                        return (
                            <TouchableOpacity
                                key={rating}
                                style={styles.distributionRow}
                                onPress={() => setSelectedFilter(rating.toString() as any)}
                            >
                                <Text style={styles.distributionRating}>{rating}</Text>
                                <Ionicons name="star" size={12} color="#F59E0B" />
                                <View style={styles.distributionBar}>
                                    <View
                                        style={[styles.distributionFill, { width: `${percentage}%` }]}
                                    />
                                </View>
                                <Text style={styles.distributionCount}>{count}</Text>
                            </TouchableOpacity>
                        );
                    })}
                </View>
            </View>

            <View style={styles.summaryFooter}>
                <View style={styles.recommendationRow}>
                    <Ionicons name="thumbs-up" size={16} color="#10B981" />
                    <Text style={styles.recommendationText}>
                        {summary.recommendationPercentage}% recommend this product
                    </Text>
                </View>

                <TouchableOpacity onPress={() => setSelectedFilter('all')}>
                    <Text style={styles.showAllText}>
                        {selectedFilter !== 'all' ? 'Show all' : ''}
                    </Text>
                </TouchableOpacity>
            </View>
        </View>
    );

    const renderReviewCard = (review: Review) => {
        const isExpanded = expandedReviews.has(review.id);
        const shouldShowExpand = review.comment.length > 200;

        return (
            <View key={review.id} style={styles.reviewCard}>
                {/* Review Header */}
                <View style={styles.reviewHeader}>
                    <View style={styles.reviewUserSection}>
                        <View style={styles.avatarContainer}>
                            {review.userAvatar ? (
                                <Image
                                    source={{ uri: review.userAvatar }}
                                    style={styles.userAvatar}
                                />
                            ) : (
                                <View style={styles.defaultAvatar}>
                                    <Ionicons name="person" size={20} color="#6B7280" />
                                </View>
                            )}
                        </View>

                        <View style={styles.userInfo}>
                            <View style={styles.userNameRow}>
                                <Text style={styles.userName}>
                                    {review.userName}
                                </Text>
                                {review.verified && (
                                    <View style={styles.verifiedBadge}>
                                        <Text style={styles.verifiedText}>
                                            Verified
                                        </Text>
                                    </View>
                                )}
                            </View>

                            <View style={styles.reviewMeta}>
                                {renderRatingStars(review.rating)}
                                <Text style={styles.reviewDate}>
                                    {new Date(review.date).toLocaleDateString()}
                                </Text>
                            </View>
                        </View>
                    </View>
                </View>

                {/* Review Content */}
                <View style={styles.reviewContent}>
                    <Text style={styles.reviewTitle}>{review.title}</Text>
                    <Text
                        style={styles.reviewComment}
                        numberOfLines={isExpanded ? undefined : shouldShowExpand ? 3 : undefined}
                    >
                        {review.comment}
                    </Text>

                    {shouldShowExpand && (
                        <TouchableOpacity
                            style={styles.expandButton}
                            onPress={() => toggleExpandReview(review.id)}
                        >
                            <Text style={styles.expandText}>
                                {isExpanded ? 'Show less' : 'Read more'}
                            </Text>
                        </TouchableOpacity>
                    )}
                </View>

                {/* Pros and Cons */}
                {(review.pros?.length || review.cons?.length) && (
                    <View style={styles.prosConsContainer}>
                        {review.pros?.length ? (
                            <View style={styles.prosSection}>
                                <Text style={styles.prosTitle}>Pros:</Text>
                                {review.pros.map((pro, index) => (
                                    <View key={index} style={styles.proConItem}>
                                        <Ionicons name="add-circle" size={12} color="#10B981" />
                                        <Text style={styles.proText}>{pro}</Text>
                                    </View>
                                ))}
                            </View>
                        ) : null}

                        {review.cons?.length ? (
                            <View style={styles.consSection}>
                                <Text style={styles.consTitle}>Cons:</Text>
                                {review.cons.map((con, index) => (
                                    <View key={index} style={styles.proConItem}>
                                        <Ionicons name="remove-circle" size={12} color="#EF4444" />
                                        <Text style={styles.conText}>{con}</Text>
                                    </View>
                                ))}
                            </View>
                        ) : null}
                    </View>
                )}

                {/* Review Images */}
                {review.images?.length ? (
                    <ScrollView
                        horizontal
                        showsHorizontalScrollIndicator={false}
                        style={styles.reviewImagesContainer}
                    >
                        {review.images.map((image, index) => (
                            <View key={index} style={styles.reviewImageWrapper}>
                                <Image
                                    source={{ uri: image }}
                                    style={styles.reviewImage}
                                />
                            </View>
                        ))}
                    </ScrollView>
                ) : null}

                {/* Review Actions */}
                <View style={styles.reviewActions}>
                    <View style={styles.reviewActionsLeft}>
                        <TouchableOpacity
                            style={styles.helpfulButton}
                            onPress={() => onMarkHelpful?.(review.id)}
                        >
                            <Ionicons name="thumbs-up-outline" size={16} color="#6B7280" />
                            <Text style={styles.helpfulText}>
                                Helpful ({review.helpful})
                            </Text>
                        </TouchableOpacity>

                        {review.wouldRecommend && (
                            <View style={styles.recommendsButton}>
                                <Ionicons name="checkmark-circle" size={16} color="#10B981" />
                                <Text style={styles.recommendsText}>Recommends</Text>
                            </View>
                        )}
                    </View>

                    <TouchableOpacity onPress={() => onReportReview?.(review.id)}>
                        <Ionicons name="flag-outline" size={16} color="#6B7280" />
                    </TouchableOpacity>
                </View>
            </View>
        );
    };

    const renderWriteReviewModal = () => (
        <Modal
            visible={showWriteModal}
            animationType="slide"
            presentationStyle="pageSheet"
            onRequestClose={() => setShowWriteModal(false)}
        >
            <View style={styles.modalContainer}>
                <View style={styles.modalHeader}>
                    <TouchableOpacity onPress={() => setShowWriteModal(false)}>
                        <Text style={styles.cancelButton}>Cancel</Text>
                    </TouchableOpacity>
                    <Text style={styles.modalTitle}>Write Review</Text>
                    <TouchableOpacity onPress={handleWriteReview}>
                        <Text style={styles.postButton}>Post</Text>
                    </TouchableOpacity>
                </View>

                <ScrollView style={styles.modalContent}>
                    {/* Rating */}
                    <View style={styles.modalSection}>
                        <Text style={styles.sectionTitle}>Rating</Text>
                        <View style={styles.ratingInput}>
                            {renderRatingStars(newReview.rating, 32, true)}
                            <Text style={styles.ratingLabel}>
                                {['Poor', 'Fair', 'Good', 'Very Good', 'Excellent'][newReview.rating - 1]}
                            </Text>
                        </View>
                    </View>

                    {/* Title */}
                    <View style={styles.modalSection}>
                        <Text style={styles.sectionTitle}>Review Title</Text>
                        <TextInput
                            style={styles.titleInput}
                            placeholder="Summarize your review"
                            value={newReview.title}
                            onChangeText={(text) => setNewReview(prev => ({ ...prev, title: text }))}
                            maxLength={100}
                        />
                    </View>

                    {/* Comment */}
                    <View style={styles.modalSection}>
                        <Text style={styles.sectionTitle}>Your Review</Text>
                        <TextInput
                            style={styles.commentInput}
                            placeholder="Share your experience with this product..."
                            value={newReview.comment}
                            onChangeText={(text) => setNewReview(prev => ({ ...prev, comment: text }))}
                            multiline
                            textAlignVertical="top"
                            maxLength={500}
                        />
                        <Text style={styles.characterCount}>
                            {newReview.comment.length}/500 characters
                        </Text>
                    </View>

                    {/* Recommendation */}
                    <View style={styles.modalSection}>
                        <Text style={styles.sectionTitle}>
                            Would you recommend this product?
                        </Text>
                        <View style={styles.recommendationButtons}>
                            {[
                                { value: true, label: 'Yes', color: '#10B981' },
                                { value: false, label: 'No', color: '#EF4444' },
                            ].map((option) => (
                                <TouchableOpacity
                                    key={option.label}
                                    style={[
                                        styles.recommendationButton,
                                        {
                                            backgroundColor: newReview.wouldRecommend === option.value
                                                ? option.color
                                                : '#E5E7EB'
                                        }
                                    ]}
                                    onPress={() => setNewReview(prev => ({
                                        ...prev,
                                        wouldRecommend: option.value
                                    }))}
                                >
                                    <Text
                                        style={[
                                            styles.recommendationButtonText,
                                            {
                                                color: newReview.wouldRecommend === option.value
                                                    ? '#FFFFFF'
                                                    : '#374151'
                                            }
                                        ]}
                                    >
                                        {option.label}
                                    </Text>
                                </TouchableOpacity>
                            ))}
                        </View>
                    </View>
                </ScrollView>
            </View>
        </Modal>
    );

    if (!reviews.length && !showWriteReview) {
        return (
            <View style={styles.emptyState}>
                <Ionicons name="chatbubble-outline" size={48} color="#9CA3AF" />
                <Text style={styles.emptyTitle}>No Reviews Yet</Text>
                <Text style={styles.emptySubtitle}>
                    Be the first to review this product
                </Text>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            {/* Summary */}
            {summary.totalReviews > 0 && renderReviewSummary()}

            {/* Write Review Button */}
            {showWriteReview && canWriteReview && (
                <TouchableOpacity
                    style={styles.writeReviewButton}
                    onPress={() => setShowWriteModal(true)}
                >
                    <Ionicons name="create" size={20} color="white" />
                    <Text style={styles.writeReviewText}>Write a Review</Text>
                </TouchableOpacity>
            )}

            {/* Reviews List */}
            {displayedReviews.map(renderReviewCard)}

            {/* See More Button */}
            {reviews.length > maxDisplayedReviews && onSeeAllReviews && (
                <TouchableOpacity
                    style={styles.seeAllButton}
                    onPress={onSeeAllReviews}
                >
                    <Text style={styles.seeAllText}>
                        See All {reviews.length} Reviews
                    </Text>
                </TouchableOpacity>
            )}

            {renderWriteReviewModal()}
        </View>
    );
}

const styles = StyleSheet.create({
    // Container
    container: {
        marginBottom: 24,
    },

    // Stars
    starsContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    starIcon: {
        marginRight: 2,
    },

    // Summary
    summaryContainer: {
        backgroundColor: '#FFFFFF',
        borderRadius: 16,
        padding: 24,
        marginBottom: 16,
        borderWidth: 1,
        borderColor: '#F3F4F6',
        ...Platform.select({
            ios: {
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.08,
                shadowRadius: 8,
            },
            android: {
                elevation: 3,
            },
        }),
    },
    summaryHeader: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        marginBottom: 20,
    },
    ratingOverview: {
        alignItems: 'center',
        marginRight: 32,
        minWidth: 100,
    },
    averageRating: {
        fontSize: 42,
        fontWeight: '800',
        color: '#111827',
        marginBottom: 4,
        ...Platform.select({
            ios: {
                fontFamily: 'System',
            },
            android: {
                fontFamily: 'sans-serif-medium',
            },
        }),
    },
    totalReviews: {
        color: '#6B7280',
        fontSize: 14,
        marginTop: 8,
        fontWeight: '500',
    },
    ratingDistribution: {
        flex: 1,
    },
    distributionRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 8,
        paddingVertical: 2,
    },
    distributionRating: {
        fontSize: 14,
        color: '#6B7280',
        width: 20,
        fontWeight: '500',
    },
    distributionBar: {
        flex: 1,
        backgroundColor: '#F3F4F6',
        borderRadius: 6,
        height: 8,
        marginHorizontal: 12,
        overflow: 'hidden',
    },
    distributionFill: {
        backgroundColor: '#F59E0B',
        height: '100%',
        borderRadius: 6,
        minWidth: 2,
    },
    distributionCount: {
        fontSize: 14,
        color: '#6B7280',
        width: 36,
        textAlign: 'right',
        fontWeight: '500',
    },
    summaryFooter: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingTop: 20,
        borderTopWidth: 1,
        borderTopColor: '#F3F4F6',
    },
    recommendationRow: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    recommendationText: {
        color: '#10B981',
        fontWeight: '600',
        marginLeft: 8,
        fontSize: 15,
    },
    showAllText: {
        color: '#2563EB',
        fontWeight: '600',
        fontSize: 14,
    },

    // Review Card
    reviewCard: {
        backgroundColor: '#FFFFFF',
        borderRadius: 16,
        padding: 20,
        marginBottom: 16,
        borderWidth: 1,
        borderColor: '#F3F4F6',
        ...Platform.select({
            ios: {
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.06,
                shadowRadius: 6,
            },
            android: {
                elevation: 2,
            },
        }),
    },
    reviewHeader: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        justifyContent: 'space-between',
        marginBottom: 16,
    },
    reviewUserSection: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        flex: 1,
    },
    avatarContainer: {
        marginRight: 12,
    },
    userAvatar: {
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: '#F3F4F6',
    },
    defaultAvatar: {
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: '#E5E7EB',
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 1,
        borderColor: '#D1D5DB',
    },
    userInfo: {
        flex: 1,
    },
    userNameRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 6,
    },
    userName: {
        fontWeight: '700',
        color: '#111827',
        marginRight: 8,
        fontSize: 16,
        ...Platform.select({
            ios: {
                fontFamily: 'System',
            },
            android: {
                fontFamily: 'sans-serif-medium',
            },
        }),
    },
    verifiedBadge: {
        backgroundColor: '#DCFCE7',
        borderRadius: 12,
        paddingHorizontal: 8,
        paddingVertical: 3,
        borderWidth: 1,
        borderColor: '#BBF7D0',
    },
    verifiedText: {
        color: '#15803D',
        fontSize: 11,
        fontWeight: '700',
        textTransform: 'uppercase',
        letterSpacing: 0.5,
    },
    reviewMeta: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    reviewDate: {
        color: '#6B7280',
        fontSize: 14,
        marginLeft: 12,
        fontWeight: '500',
    },

    // Review Content
    reviewContent: {
        marginBottom: 16,
    },
    reviewTitle: {
        fontWeight: '700',
        color: '#111827',
        marginBottom: 8,
        fontSize: 16,
        lineHeight: 22,
        ...Platform.select({
            ios: {
                fontFamily: 'System',
            },
            android: {
                fontFamily: 'sans-serif-medium',
            },
        }),
    },
    reviewComment: {
        color: '#374151',
        lineHeight: 22,
        fontSize: 15,
    },
    expandButton: {
        marginTop: 8,
        paddingVertical: 4,
    },
    expandText: {
        color: '#2563EB',
        fontWeight: '600',
        fontSize: 14,
    },

    // Pros and Cons
    prosConsContainer: {
        marginBottom: 16,
        backgroundColor: '#F9FAFB',
        borderRadius: 12,
        padding: 16,
    },
    prosSection: {
        marginBottom: 12,
    },
    prosTitle: {
        fontWeight: '700',
        color: '#15803D',
        marginBottom: 8,
        fontSize: 14,
        textTransform: 'uppercase',
        letterSpacing: 0.5,
    },
    consSection: {},
    consTitle: {
        fontWeight: '700',
        color: '#DC2626',
        marginBottom: 8,
        fontSize: 14,
        textTransform: 'uppercase',
        letterSpacing: 0.5,
    },
    proConItem: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        marginBottom: 6,
        paddingLeft: 4,
    },
    proText: {
        color: '#15803D',
        fontSize: 14,
        marginLeft: 8,
        flex: 1,
        lineHeight: 18,
    },
    conText: {
        color: '#DC2626',
        fontSize: 14,
        marginLeft: 8,
        flex: 1,
        lineHeight: 18,
    },

    // Review Images
    reviewImagesContainer: {
        marginBottom: 16,
        paddingVertical: 4,
    },
    reviewImageWrapper: {
        marginRight: 12,
        borderRadius: 8,
        overflow: 'hidden',
        ...Platform.select({
            ios: {
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 1 },
                shadowOpacity: 0.1,
                shadowRadius: 3,
            },
            android: {
                elevation: 2,
            },
        }),
    },
    reviewImage: {
        width: 80,
        height: 80,
        borderRadius: 8,
        backgroundColor: '#F3F4F6',
    },

    // Review Actions
    reviewActions: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingTop: 16,
        borderTopWidth: 1,
        borderTopColor: '#F3F4F6',
    },
    reviewActionsLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 20,
    },
    helpfulButton: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 6,
        paddingHorizontal: 8,
        borderRadius: 8,
        backgroundColor: '#F9FAFB',
    },
    helpfulText: {
        color: '#6B7280',
        fontSize: 14,
        marginLeft: 6,
        fontWeight: '500',
    },
    recommendsButton: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 6,
        paddingHorizontal: 8,
        borderRadius: 8,
        backgroundColor: '#ECFDF5',
    },
    recommendsText: {
        color: '#10B981',
        fontSize: 14,
        marginLeft: 6,
        fontWeight: '600',
    },

    // Write Review
    writeReviewButton: {
        backgroundColor: '#2563EB',
        borderRadius: 12,
        padding: 16,
        marginBottom: 16,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        ...Platform.select({
            ios: {
                shadowColor: '#2563EB',
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.15,
                shadowRadius: 8,
            },
            android: {
                elevation: 4,
            },
        }),
    },
    writeReviewText: {
        color: '#FFFFFF',
        fontWeight: '700',
        marginLeft: 8,
        fontSize: 16,
    },

    // See All
    seeAllButton: {
        backgroundColor: '#F3F4F6',
        borderRadius: 12,
        padding: 16,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#E5E7EB',
    },
    seeAllText: {
        color: '#374151',
        fontWeight: '600',
        fontSize: 15,
    },

    // Modal
    modalContainer: {
        flex: 1,
        backgroundColor: '#FFFFFF',
    },
    modalHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: 20,
        borderBottomWidth: 1,
        borderBottomColor: '#F3F4F6',
        backgroundColor: '#FAFAFA',
        ...Platform.select({
            ios: {
                paddingTop: 60,
            },
            android: {
                paddingTop: 20,
            },
        }),
    },
    cancelButton: {
        color: '#6B7280',
        fontWeight: '600',
        fontSize: 16,
        paddingVertical: 8,
        paddingHorizontal: 12,
    },
    modalTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: '#111827',
        ...Platform.select({
            ios: {
                fontFamily: 'System',
            },
            android: {
                fontFamily: 'sans-serif-medium',
            },
        }),
    },
    postButton: {
        color: '#2563EB',
        fontWeight: '700',
        fontSize: 16,
        paddingVertical: 8,
        paddingHorizontal: 12,
    },
    modalContent: {
        flex: 1,
        padding: 20,
        backgroundColor: '#FFFFFF',
    },
    modalSection: {
        marginBottom: 32,
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: '700',
        color: '#111827',
        marginBottom: 16,
        ...Platform.select({
            ios: {
                fontFamily: 'System',
            },
            android: {
                fontFamily: 'sans-serif-medium',
            },
        }),
    },
    ratingInput: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 8,
    },
    ratingLabel: {
        marginLeft: 16,
        color: '#6B7280',
        fontSize: 16,
        fontWeight: '500',
    },
    titleInput: {
        borderWidth: 1,
        borderColor: '#D1D5DB',
        borderRadius: 12,
        paddingHorizontal: 16,
        paddingVertical: 14,
        fontSize: 16,
        backgroundColor: '#FFFFFF',
        ...Platform.select({
            ios: {
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 1 },
                shadowOpacity: 0.05,
                shadowRadius: 2,
            },
            android: {
                elevation: 1,
            },
        }),
    },
    commentInput: {
        borderWidth: 1,
        borderColor: '#D1D5DB',
        borderRadius: 12,
        paddingHorizontal: 16,
        paddingVertical: 14,
        height: 120,
        fontSize: 16,
        backgroundColor: '#FFFFFF',
        ...Platform.select({
            ios: {
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 1 },
                shadowOpacity: 0.05,
                shadowRadius: 2,
            },
            android: {
                elevation: 1,
            },
        }),
    },
    characterCount: {
        color: '#9CA3AF',
        fontSize: 13,
        marginTop: 8,
        textAlign: 'right',
        fontWeight: '500',
    },
    recommendationButtons: {
        flexDirection: 'row',
        gap: 12,
    },
    recommendationButton: {
        flex: 1,
        paddingVertical: 14,
        borderRadius: 12,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: 'transparent',
        ...Platform.select({
            ios: {
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 1 },
                shadowOpacity: 0.05,
                shadowRadius: 2,
            },
            android: {
                elevation: 1,
            },
        }),
    },
    recommendationButtonText: {
        fontWeight: '700',
        fontSize: 15,
    },

    // Empty State
    emptyState: {
        backgroundColor: '#FFFFFF',
        borderRadius: 16,
        padding: 32,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#F3F4F6',
        ...Platform.select({
            ios: {
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 1 },
                shadowOpacity: 0.05,
                shadowRadius: 3,
            },
            android: {
                elevation: 1,
            },
        }),
    },
    emptyTitle: {
        color: '#6B7280',
        fontSize: 20,
        fontWeight: '600',
        marginTop: 16,
        textAlign: 'center',
        ...Platform.select({
            ios: {
                fontFamily: 'System',
            },
            android: {
                fontFamily: 'sans-serif-medium',
            },
        }),
    },
    emptySubtitle: {
        color: '#9CA3AF',
        fontSize: 15,
        marginTop: 8,
        textAlign: 'center',
        lineHeight: 20,
    },
});