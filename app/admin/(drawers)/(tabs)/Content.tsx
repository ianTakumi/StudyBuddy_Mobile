// app/Content.tsx - Content Management Screen
import React, { useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

export default function ContentScreen() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedContent, setSelectedContent] = useState<string[]>([]);
  const [activeTab, setActiveTab] = useState("flashcards"); // flashcards, notes, reports

  // Mock content data
  const contentData = {
    flashcards: [
      {
        id: "1",
        title: "Biology 101 - Cell Structure",
        author: "Juan Dela Cruz",
        subject: "Biology",
        cards: 45,
        rating: 4.8,
        status: "approved",
        createdAt: "2024-01-15",
        reports: 0,
        popularity: "high",
      },
      {
        id: "2",
        title: "Chemistry Basics",
        author: "Maria Santos",
        subject: "Chemistry",
        cards: 32,
        rating: 4.5,
        status: "pending",
        createdAt: "2024-01-18",
        reports: 2,
        popularity: "medium",
      },
      {
        id: "3",
        title: "Physics Formulas",
        author: "Pedro Reyes",
        subject: "Physics",
        cards: 28,
        rating: 4.2,
        status: "rejected",
        createdAt: "2024-01-20",
        reports: 1,
        popularity: "low",
      },
      {
        id: "4",
        title: "History Timeline",
        author: "Anna Lopez",
        subject: "History",
        cards: 56,
        rating: 4.9,
        status: "approved",
        createdAt: "2024-01-22",
        reports: 0,
        popularity: "high",
      },
    ],
    notes: [
      {
        id: "1",
        title: "Mathematics Calculus Notes",
        author: "Michael Tan",
        subject: "Mathematics",
        pages: 12,
        downloads: 145,
        status: "approved",
        createdAt: "2024-01-14",
        reports: 0,
      },
      {
        id: "2",
        title: "Organic Chemistry Guide",
        author: "Sarah Lim",
        subject: "Chemistry",
        pages: 8,
        downloads: 89,
        status: "pending",
        createdAt: "2024-01-19",
        reports: 1,
      },
    ],
    reported: [
      {
        id: "1",
        title: "Inappropriate Biology Set",
        author: "Unknown User",
        subject: "Biology",
        type: "flashcard",
        reports: 5,
        severity: "high",
        reportedAt: "2024-01-23",
        status: "under_review",
      },
      {
        id: "2",
        title: "Copyright Violation - Math Notes",
        author: "John Doe",
        subject: "Mathematics",
        type: "notes",
        reports: 3,
        severity: "medium",
        reportedAt: "2024-01-22",
        status: "under_review",
      },
    ],
  };

  const stats = {
    totalFlashcards: 15680,
    totalNotes: 2345,
    pendingReview: 23,
    reportedContent: 8,
    approvedContent: 14560,
  };

  const categories = [
    "all",
    "biology",
    "chemistry",
    "physics",
    "mathematics",
    "history",
  ];

  // Filter content based on search and category
  const filteredContent = contentData[activeTab].filter((item) => {
    const matchesSearch =
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.author.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.subject.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesCategory =
      selectedCategory === "all" ||
      item.subject.toLowerCase() === selectedCategory;

    return matchesSearch && matchesCategory;
  });

  const toggleContentSelection = (contentId: string) => {
    setSelectedContent((prev) =>
      prev.includes(contentId)
        ? prev.filter((id) => id !== contentId)
        : [...prev, contentId]
    );
  };

  const selectAllContent = () => {
    setSelectedContent(
      selectedContent.length === filteredContent.length
        ? []
        : filteredContent.map((item) => item.id)
    );
  };

  const handleContentAction = (action: string, contentId?: string) => {
    const contentToAction = contentId ? [contentId] : selectedContent;

    if (contentToAction.length === 0) {
      Alert.alert("No content selected", "Please select at least one item.");
      return;
    }

    Alert.alert(
      `${action} Content`,
      `Are you sure you want to ${action.toLowerCase()} ${contentToAction.length} item(s)?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Confirm",
          style: "destructive",
          onPress: () => {
            // Handle the action here
            console.log(`${action} content:`, contentToAction);
            setSelectedContent([]);
          },
        },
      ]
    );
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "approved":
        return "bg-green-500";
      case "pending":
        return "bg-yellow-500";
      case "rejected":
        return "bg-red-500";
      case "under_review":
        return "bg-orange-500";
      default:
        return "bg-gray-500";
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "approved":
        return "Approved";
      case "pending":
        return "Pending Review";
      case "rejected":
        return "Rejected";
      case "under_review":
        return "Under Review";
      default:
        return status;
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "high":
        return "bg-red-500";
      case "medium":
        return "bg-orange-500";
      case "low":
        return "bg-yellow-500";
      default:
        return "bg-gray-500";
    }
  };

  const ContentCard = ({ item, type }: { item: any; type: string }) => (
    <TouchableOpacity
      className={`bg-white p-4 rounded-lg mb-3 border-2 ${
        selectedContent.includes(item.id)
          ? "border-blue-500 bg-blue-50"
          : "border-gray-200"
      }`}
      onPress={() => toggleContentSelection(item.id)}
    >
      <View className="flex-row justify-between items-start mb-3">
        <View className="flex-1">
          <Text className="text-lg font-semibold text-gray-900 mb-1">
            {item.title}
          </Text>
          <Text className="text-gray-600 text-sm mb-1">
            By {item.author} • {item.subject}
          </Text>
          <Text className="text-gray-500 text-sm">
            Created: {item.createdAt}
            {item.reports > 0 && ` • ${item.reports} report(s)`}
          </Text>
        </View>

        <View className="items-end">
          <View
            className={`px-2 py-1 rounded-full ${getStatusColor(item.status)} mb-1`}
          >
            <Text className="text-white text-xs font-medium">
              {getStatusText(item.status)}
            </Text>
          </View>
          {item.severity && (
            <View
              className={`px-2 py-1 rounded-full ${getSeverityColor(item.severity)} mt-1`}
            >
              <Text className="text-white text-xs font-medium capitalize">
                {item.severity}
              </Text>
            </View>
          )}
        </View>
      </View>

      <View className="flex-row justify-between items-center border-t border-gray-100 pt-3">
        <View className="flex-row space-x-4">
          {type === "flashcards" && (
            <View className="flex-row items-center">
              <Ionicons name="copy-outline" size={16} color="#6B7280" />
              <Text className="text-gray-600 text-sm ml-1">
                {item.cards} cards
              </Text>
            </View>
          )}
          {type === "notes" && (
            <View className="flex-row items-center">
              <Ionicons name="document-outline" size={16} color="#6B7280" />
              <Text className="text-gray-600 text-sm ml-1">
                {item.pages} pages
              </Text>
            </View>
          )}
          <View className="flex-row items-center">
            <Ionicons name="star" size={16} color="#FFD700" />
            <Text className="text-gray-600 text-sm ml-1">{item.rating}</Text>
          </View>
          {item.downloads && (
            <View className="flex-row items-center">
              <Ionicons name="download-outline" size={16} color="#6B7280" />
              <Text className="text-gray-600 text-sm ml-1">
                {item.downloads}
              </Text>
            </View>
          )}
        </View>

        <View className="flex-row space-x-2">
          <TouchableOpacity
            className="p-2 bg-gray-100 rounded-lg"
            onPress={() => handleContentAction("Edit", item.id)}
          >
            <Ionicons name="create-outline" size={16} color="#4B5563" />
          </TouchableOpacity>
          <TouchableOpacity
            className="p-2 bg-gray-100 rounded-lg"
            onPress={() =>
              handleContentAction(
                item.status === "approved" ? "Disable" : "Approve",
                item.id
              )
            }
          >
            <Ionicons
              name={
                item.status === "approved"
                  ? "eye-off-outline"
                  : "checkmark-circle-outline"
              }
              size={16}
              color={item.status === "approved" ? "#EF4444" : "#10B981"}
            />
          </TouchableOpacity>
        </View>
      </View>
    </TouchableOpacity>
  );

  const StatCard = ({ title, value, icon, color = "#4A90E2" }) => (
    <View className="bg-white rounded-lg p-4 shadow-sm flex-1 mx-1">
      <View className="flex-row items-center justify-between">
        <View>
          <Text className="text-2xl font-bold text-gray-900">{value}</Text>
          <Text className="text-gray-600 text-sm mt-1">{title}</Text>
        </View>
        <View
          className="w-10 h-10 rounded-full items-center justify-center"
          style={{ backgroundColor: `${color}20` }}
        >
          <Ionicons name={icon} size={20} color={color} />
        </View>
      </View>
    </View>
  );

  return (
    <View className="flex-1 bg-gray-50 pt-14">
      {/* Header */}
      <View className="bg-white px-6 py-4 shadow-sm">
        <View className="flex-row justify-between items-center">
          <Text className="text-2xl font-bold text-gray-900">
            Content Management
          </Text>
          <TouchableOpacity
            className="bg-blue-500 px-4 py-2 rounded-lg flex-row items-center"
            onPress={() => {
              /* Navigate to add content */
            }}
          >
            <Ionicons name="add" size={20} color="white" />
            <Text className="text-white font-medium ml-2">Add Content</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Stats Overview */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        className="px-4 py-3"
      >
        <View className="flex-row space-x-2">
          <StatCard
            title="Total Flashcards"
            value={stats.totalFlashcards.toLocaleString()}
            icon="copy-outline"
            color="#4A90E2"
          />
          <StatCard
            title="Study Notes"
            value={stats.totalNotes.toLocaleString()}
            icon="document-outline"
            color="#34C759"
          />
          <StatCard
            title="Pending Review"
            value={stats.pendingReview.toString()}
            icon="time-outline"
            color="#FF9500"
          />
          <StatCard
            title="Reported"
            value={stats.reportedContent.toString()}
            icon="flag-outline"
            color="#EF4444"
          />
          <StatCard
            title="Approved"
            value={stats.approvedContent.toLocaleString()}
            icon="checkmark-circle-outline"
            color="#10B981"
          />
        </View>
      </ScrollView>

      {/* Tabs */}
      <View className="bg-white px-4 py-2 border-b border-gray-200">
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          className="flex-row"
        >
          {[
            { key: "flashcards", label: "Flashcards", icon: "copy-outline" },
            { key: "notes", label: "Study Notes", icon: "document-outline" },
            { key: "reports", label: "Reported Content", icon: "flag-outline" },
          ].map((tab) => (
            <TouchableOpacity
              key={tab.key}
              className={`px-4 py-3 mx-1 rounded-lg flex-row items-center ${
                activeTab === tab.key ? "bg-blue-500" : "bg-gray-100"
              }`}
              onPress={() => {
                setActiveTab(tab.key);
                setSelectedContent([]);
                setSearchQuery("");
                setSelectedCategory("all");
              }}
            >
              <Ionicons
                name={tab.icon}
                size={18}
                color={activeTab === tab.key ? "white" : "#6B7280"}
              />
              <Text
                className={`ml-2 font-medium ${
                  activeTab === tab.key ? "text-white" : "text-gray-700"
                }`}
              >
                {tab.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Search and Filters */}
      <View className="bg-white px-4 py-3 shadow-sm">
        <View className="flex-row space-x-3 mb-3">
          <View className="flex-1 bg-gray-100 rounded-lg px-3 py-2 flex-row items-center">
            <Ionicons name="search" size={20} color="#9CA3AF" />
            <TextInput
              placeholder={`Search ${activeTab}...`}
              value={searchQuery}
              onChangeText={setSearchQuery}
              className="flex-1 ml-2 text-gray-800"
            />
          </View>
        </View>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          className="flex-1"
        >
          <View className="flex-row space-x-2">
            {categories.map((category) => (
              <TouchableOpacity
                key={category}
                className={`px-4 py-2 rounded-full ${
                  selectedCategory === category ? "bg-blue-500" : "bg-gray-200"
                }`}
                onPress={() => setSelectedCategory(category)}
              >
                <Text
                  className={`font-medium ${
                    selectedCategory === category
                      ? "text-white"
                      : "text-gray-700"
                  }`}
                >
                  {category === "all"
                    ? "All Subjects"
                    : category.charAt(0).toUpperCase() + category.slice(1)}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </ScrollView>
      </View>

      {/* Bulk Actions */}
      {selectedContent.length > 0 && (
        <View className="bg-blue-50 px-4 py-3 border-b border-blue-200">
          <View className="flex-row justify-between items-center">
            <Text className="text-blue-800 font-medium">
              {selectedContent.length} item(s) selected
            </Text>
            <View className="flex-row space-x-2">
              <TouchableOpacity
                className="px-3 py-1 bg-green-500 rounded-lg flex-row items-center"
                onPress={() => handleContentAction("Approve")}
              >
                <Ionicons name="checkmark-circle" size={16} color="white" />
                <Text className="text-white text-sm ml-1">Approve</Text>
              </TouchableOpacity>
              <TouchableOpacity
                className="px-3 py-1 bg-red-500 rounded-lg flex-row items-center"
                onPress={() => handleContentAction("Reject")}
              >
                <Ionicons name="close-circle" size={16} color="white" />
                <Text className="text-white text-sm ml-1">Reject</Text>
              </TouchableOpacity>
              <TouchableOpacity
                className="px-3 py-1 bg-gray-500 rounded-lg flex-row items-center"
                onPress={() => handleContentAction("Delete")}
              >
                <Ionicons name="trash" size={16} color="white" />
                <Text className="text-white text-sm ml-1">Delete</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      )}

      {/* Content List */}
      <ScrollView className="flex-1 px-4 py-4">
        <View className="flex-row justify-between items-center mb-4">
          <Text className="text-gray-600">
            Showing {filteredContent.length} {activeTab}(s)
          </Text>
          {filteredContent.length > 0 && (
            <TouchableOpacity onPress={selectAllContent}>
              <Text className="text-blue-500 font-medium">
                {selectedContent.length === filteredContent.length
                  ? "Deselect All"
                  : "Select All"}
              </Text>
            </TouchableOpacity>
          )}
        </View>

        {filteredContent.map((item) => (
          <ContentCard key={item.id} item={item} type={activeTab} />
        ))}

        {filteredContent.length === 0 && (
          <View className="items-center justify-center py-12">
            <Ionicons name="document-outline" size={64} color="#9CA3AF" />
            <Text className="text-gray-500 text-lg mt-4">No content found</Text>
            <Text className="text-gray-400 text-center mt-2">
              {searchQuery || selectedCategory !== "all"
                ? "Try adjusting your search or filters"
                : `No ${activeTab} available`}
            </Text>
          </View>
        )}
      </ScrollView>
    </View>
  );
}
