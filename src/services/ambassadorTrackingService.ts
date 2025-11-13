// Ambassador Tracking Service for monitoring stories and posts with special tags
// Supports tracking across all platforms: Instagram, TikTok, Facebook, Twitter, YouTube, and Pinterest

import { Post, Activity, ChannelType } from '../types';
import { postService, activityService } from './dataService';

// Function to track stories mentioning the account
export const trackMentionedStories = async (ambassadorId: string, accountName: string): Promise<Activity[]> => {
  try {
    // Get all activities for the ambassador
    const allActivities = await activityService.getAll();
    
    // Filter for activities that mention the account
    const mentionedStories = allActivities.filter(activity => {
      // Check if it's a post activity
      if (activity.type !== 'POST' || !activity.post) return false;
      
      // Check if the post mentions the account in caption or hashtags
      const post = activity.post as Post;
      const captionMentions = post.caption?.toLowerCase().includes(accountName.toLowerCase());
      const hashtagMentions = post.hashtags?.some(tag => 
        tag.toLowerCase().includes(accountName.toLowerCase())
      );
      
      // Also check platform-specific hashtags
      const platformHashtagMentions = Object.values(post.platformHashtags || {}).some(hashtags => 
        hashtags?.some(tag => tag.toLowerCase().includes(accountName.toLowerCase()))
      );
      
      return captionMentions || hashtagMentions || platformHashtagMentions;
    });
    
    return mentionedStories;
  } catch (error) {
    console.error('Error tracking mentioned stories:', error);
    return [];
  }
};

// Function to track posts with special tags
export const trackPostsWithSpecialTags = async (ambassadorId: string, specialTags: string[]): Promise<Activity[]> => {
  try {
    // Get all activities for the ambassador
    const allActivities = await activityService.getAll();
    
    // Filter for activities with special tags
    const taggedPosts = allActivities.filter(activity => {
      // Check if it's a post activity
      if (activity.type !== 'POST' || !activity.post) return false;
      
      // Check if the post contains any of the special tags
      const post = activity.post as Post;
      const hasSpecialTag = post.hashtags?.some(tag => 
        specialTags.some(specialTag => 
          tag.toLowerCase().includes(specialTag.toLowerCase())
        )
      );
      
      // Also check platform-specific hashtags
      const hasPlatformSpecialTag = Object.values(post.platformHashtags || {}).some(hashtags => 
        hashtags?.some(tag => 
          specialTags.some(specialTag => 
            tag.toLowerCase().includes(specialTag.toLowerCase())
          )
        )
      );
      
      return hasSpecialTag || hasPlatformSpecialTag;
    });
    
    return taggedPosts;
  } catch (error) {
    console.error('Error tracking posts with special tags:', error);
    return [];
  }
};

// Function to get all tracking data for an ambassador
export const getAmbassadorTrackingData = async (ambassadorId: string, accountName: string, specialTags: string[]) => {
  try {
    const [mentionedStories, taggedPosts] = await Promise.all([
      trackMentionedStories(ambassadorId, accountName),
      trackPostsWithSpecialTags(ambassadorId, specialTags)
    ]);
    
    return {
      mentionedStories,
      taggedPosts,
      totalMentions: mentionedStories.length,
      totalTaggedPosts: taggedPosts.length
    };
  } catch (error) {
    console.error('Error getting ambassador tracking data:', error);
    return {
      mentionedStories: [],
      taggedPosts: [],
      totalMentions: 0,
      totalTaggedPosts: 0
    };
  }
};

export default {
  trackMentionedStories,
  trackPostsWithSpecialTags,
  getAmbassadorTrackingData
};