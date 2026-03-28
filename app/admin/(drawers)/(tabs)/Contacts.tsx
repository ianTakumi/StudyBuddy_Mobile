import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  FlatList,
  ActivityIndicator,
  TouchableOpacity,
  TextInput,
  Alert,
  Keyboard,
  TouchableWithoutFeedback,
} from "react-native";
import { Ionicons, MaterialIcons, Feather } from "@expo/vector-icons";
import client from "@/utils/axiosInstance";

export default function Contacts() {
  const [contacts, setContacts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editingId, setEditingId] = useState(null);
  const [editingData, setEditingData] = useState({});
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    fetchContacts();
  }, []);

  const fetchContacts = async () => {
    try {
      setLoading(true);
      const response = await client.get("/contacts");
      if (response.data.success) {
        setContacts(response.data.contacts);
      } else {
        setError("Failed to fetch contacts");
      }
    } catch (err) {
      setError(err.message || "An error occurred");
      console.error("Error fetching contacts:", err);
    } finally {
      setLoading(false);
    }
  };

  const startEditing = (contact) => {
    setEditingId(contact.id);
    setEditingData({
      first_name: contact.first_name,
      last_name: contact.last_name,
      email: contact.email,
      phone: contact.phone,
      subject: contact.subject,
      message: contact.message,
      status: contact.status,
    });
  };

  const cancelEditing = () => {
    setEditingId(null);
    setEditingData({});
  };

  const saveContact = async (contactId: string) => {
    try {
      setUpdating(true);
      const response = await client.put(
        `/contacts/${contactId}/status`,
        editingData,
      );
      if (response.data.success) {
        await fetchContacts();
        Alert.alert("Success", "Contact updated successfully!");
        cancelEditing();
      } else {
        Alert.alert("Error", "Failed to update contact");
      }
    } catch (err) {
      Alert.alert("Error", err.message || "An error occurred");
      console.error("Error updating contact:", err);
    } finally {
      setUpdating(false);
    }
  };

  const updateStatus = async (contactId: string, newStatus: string) => {
    try {
      const response = await client.put(`/contacts/${contactId}/status`, {
        status: newStatus,
      });
      if (response.data.success) {
        await fetchContacts();
        Alert.alert("Success", `Status updated to ${newStatus}`);
      }
    } catch (err) {
      Alert.alert("Error", "Failed to update status");
      console.error("Error updating status:", err);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "pending":
        return "bg-yellow-500";
      case "read":
        return "bg-blue-500";
      case "replied":
        return "bg-purple-500";
      case "resolved":
        return "bg-green-500";
      default:
        return "bg-gray-500";
    }
  };

  const getNextStatus = (currentStatus) => {
    const statusFlow = {
      pending: "read",
      read: "replied",
      replied: "resolved",
      resolved: "resolved",
    };
    return statusFlow[currentStatus] || "pending";
  };

  const renderEditableField = (contact, field, label, icon, type = "text") => {
    const isEditing = editingId === contact.id;

    if (isEditing) {
      return (
        <View className="mb-2">
          <View className="flex-row items-center bg-gray-50 rounded-lg p-2 border border-blue-200">
            <View className="mr-2">{icon}</View>
            <TextInput
              className="flex-1 text-gray-700"
              value={editingData[field]}
              onChangeText={(text) =>
                setEditingData({ ...editingData, [field]: text })
              }
              placeholder={label}
              keyboardType={
                type === "email"
                  ? "email-address"
                  : type === "phone"
                    ? "phone-pad"
                    : "default"
              }
              editable={!updating}
            />
          </View>
        </View>
      );
    }

    return (
      <View className="flex-row items-center bg-gray-50 rounded-lg p-2 mb-2">
        <View className="mr-2">{icon}</View>
        <Text className="text-gray-700 flex-1">{contact[field]}</Text>
      </View>
    );
  };

  const renderContactItem = ({ item }) => {
    const isEditing = editingId === item.id;

    return (
      <View className="bg-white rounded-2xl shadow-lg mx-4 mb-4 overflow-hidden">
        {/* Status Bar */}
        <View
          className={`${getStatusColor(item.status)} px-4 py-1 flex-row justify-between items-center`}
        >
          <Text className="text-white text-xs font-medium uppercase">
            {item.status}
          </Text>
          {!isEditing && item.status !== "resolved" && (
            <TouchableOpacity
              onPress={() => updateStatus(item.id, getNextStatus(item.status))}
            >
              <Ionicons name="refresh" size={14} color="white" />
            </TouchableOpacity>
          )}
        </View>

        <View className="p-4">
          {isEditing ? (
            // Edit Mode
            <>
              <View className="flex-row justify-between items-start mb-4">
                <View className="flex-row items-center flex-1">
                  <View className="w-12 h-12 rounded-full bg-blue-500 items-center justify-center mr-3">
                    <Text className="text-white text-xl font-bold">
                      {editingData.first_name?.charAt(0)}
                      {editingData.last_name?.charAt(0)}
                    </Text>
                  </View>
                  <View className="flex-1">
                    <View className="flex-row gap-2">
                      <TextInput
                        className="flex-1 text-lg font-bold text-gray-800 border-b border-gray-200"
                        value={editingData.first_name}
                        onChangeText={(text) =>
                          setEditingData({ ...editingData, first_name: text })
                        }
                        placeholder="First Name"
                      />
                      <TextInput
                        className="flex-1 text-lg font-bold text-gray-800 border-b border-gray-200"
                        value={editingData.last_name}
                        onChangeText={(text) =>
                          setEditingData({ ...editingData, last_name: text })
                        }
                        placeholder="Last Name"
                      />
                    </View>
                  </View>
                </View>
              </View>

              {renderEditableField(
                item,
                "email",
                "Email",
                <Ionicons name="mail-outline" size={20} color="#3b82f6" />,
                "email",
              )}
              {renderEditableField(
                item,
                "phone",
                "Phone",
                <Ionicons name="call-outline" size={20} color="#3b82f6" />,
                "phone",
              )}
              {renderEditableField(
                item,
                "subject",
                "Subject",
                <Ionicons name="bookmark-outline" size={20} color="#3b82f6" />,
              )}

              <View className="mb-2">
                <View className="bg-blue-50 rounded-lg p-2 border border-blue-200">
                  <View className="flex-row items-start">
                    <Ionicons
                      name="chatbubble-outline"
                      size={20}
                      color="#3b82f6"
                      className="mr-2"
                    />
                    <TextInput
                      className="flex-1 text-gray-700"
                      value={editingData.message}
                      onChangeText={(text) =>
                        setEditingData({ ...editingData, message: text })
                      }
                      placeholder="Message"
                      multiline
                      numberOfLines={3}
                      textAlignVertical="top"
                    />
                  </View>
                </View>
              </View>

              <View className="mb-2">
                <Text className="text-gray-700 font-semibold mb-1">Status</Text>
                <View className="flex-row gap-2">
                  {["pending", "read", "replied", "resolved"].map((status) => (
                    <TouchableOpacity
                      key={status}
                      onPress={() => setEditingData({ ...editingData, status })}
                      className={`flex-1 py-2 rounded-lg ${
                        editingData.status === status
                          ? "bg-blue-500"
                          : "bg-gray-200"
                      }`}
                    >
                      <Text
                        className={`text-center text-sm ${
                          editingData.status === status
                            ? "text-white"
                            : "text-gray-700"
                        }`}
                      >
                        {status.charAt(0).toUpperCase() + status.slice(1)}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              <View className="flex-row gap-2 mt-3">
                <TouchableOpacity
                  onPress={cancelEditing}
                  className="flex-1 bg-gray-300 py-2 rounded-lg"
                >
                  <Text className="text-center text-gray-700 font-medium">
                    Cancel
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => saveContact(item.id)}
                  disabled={updating}
                  className="flex-1 bg-blue-500 py-2 rounded-lg"
                >
                  {updating ? (
                    <ActivityIndicator size="small" color="white" />
                  ) : (
                    <Text className="text-center text-white font-medium">
                      Save
                    </Text>
                  )}
                </TouchableOpacity>
              </View>
            </>
          ) : (
            // View Mode
            <>
              <View className="flex-row justify-between items-start mb-3">
                <View className="flex-row items-center flex-1">
                  <View className="w-12 h-12 rounded-full bg-blue-100 items-center justify-center mr-3">
                    <Text className="text-blue-600 text-xl font-bold">
                      {item.first_name.charAt(0)}
                      {item.last_name.charAt(0)}
                    </Text>
                  </View>
                  <View className="flex-1">
                    <Text className="text-lg font-bold text-gray-800">
                      {item.first_name} {item.last_name}
                    </Text>
                    <Text className="text-xs text-gray-500">
                      ID: {item.id.slice(0, 8)}...
                    </Text>
                  </View>
                </View>
                <View className="flex-row gap-1">
                  <TouchableOpacity
                    onPress={() => startEditing(item)}
                    className="p-2"
                  >
                    <Feather name="edit-2" size={18} color="#3b82f6" />
                  </TouchableOpacity>
                </View>
              </View>

              <View className="gap-2 mt-2">
                <View className="flex-row items-center bg-gray-50 rounded-lg p-2">
                  <Ionicons
                    name="mail-outline"
                    size={20}
                    color="#3b82f6"
                    className="mr-2"
                  />
                  <Text className="text-gray-700 flex-1">{item.email}</Text>
                </View>

                <View className="flex-row items-center bg-gray-50 rounded-lg p-2">
                  <Ionicons
                    name="call-outline"
                    size={20}
                    color="#3b82f6"
                    className="mr-2"
                  />
                  <Text className="text-gray-700">{item.phone}</Text>
                </View>

                <View className="flex-row items-center bg-blue-50 rounded-lg p-2">
                  <Ionicons
                    name="bookmark-outline"
                    size={20}
                    color="#3b82f6"
                    className="mr-2"
                  />
                  <Text className="text-gray-700 font-medium flex-1">
                    {item.subject}
                  </Text>
                </View>

                <View className="bg-gray-50 rounded-xl p-3 mt-1">
                  <View className="flex-row items-start">
                    <Ionicons
                      name="chatbubble-outline"
                      size={20}
                      color="#3b82f6"
                      className="mr-2"
                    />
                    <Text className="text-gray-700 flex-1">{item.message}</Text>
                  </View>
                </View>

                <View className="flex-row justify-between items-center mt-2">
                  <View className="flex-row items-center">
                    <Ionicons name="time-outline" size={12} color="#9ca3af" />
                    <Text className="text-xs text-gray-400 ml-1">
                      {new Date(item.created_at).toLocaleDateString()} at{" "}
                      {new Date(item.created_at).toLocaleTimeString()}
                    </Text>
                  </View>
                  {item.status !== "resolved" && (
                    <TouchableOpacity
                      onPress={() =>
                        updateStatus(item.id, getNextStatus(item.status))
                      }
                      className="bg-blue-500 px-3 py-1 rounded-full flex-row items-center"
                    >
                      <Ionicons name="refresh" size={12} color="white" />
                      <Text className="text-white text-xs font-medium ml-1">
                        Update Status
                      </Text>
                    </TouchableOpacity>
                  )}
                </View>
              </View>
            </>
          )}
        </View>
      </View>
    );
  };

  if (loading) {
    return (
      <View className="flex-1 justify-center items-center bg-gradient-to-b from-blue-50 to-gray-50">
        <ActivityIndicator size="large" color="#3b82f6" />
        <Text className="mt-4 text-blue-600 font-medium">
          Loading contacts...
        </Text>
      </View>
    );
  }

  if (error) {
    return (
      <View className="flex-1 justify-center items-center bg-gray-50">
        <View className="bg-red-50 rounded-2xl p-6 mx-4 border border-red-200">
          <MaterialIcons
            name="error-outline"
            size={48}
            color="#ef4444"
            className="self-center mb-2"
          />
          <Text className="text-red-600 text-center font-medium">{error}</Text>
          <TouchableOpacity
            onPress={fetchContacts}
            className="mt-4 bg-red-500 px-4 py-2 rounded-lg"
          >
            <Text className="text-white text-center font-medium">Retry</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <View className="flex-1 bg-gradient-to-b from-blue-50 to-gray-50">
        {/* Header */}
        <View className="bg-blue-600 px-5 py-6 rounded-b-3xl shadow-lg">
          <View className="flex-row justify-between items-center mb-1">
            <Text className="text-3xl font-bold text-white">Contacts</Text>
            <MaterialIcons name="contacts" size={32} color="white" />
          </View>
          <Text className="text-blue-100 text-sm">
            Total: {contacts.length} contact{contacts.length !== 1 ? "s" : ""}
          </Text>
          <View className="flex-row mt-3 flex-wrap gap-2">
            <View className="bg-white/20 rounded-full px-3 py-1 flex-row items-center">
              <Ionicons name="time-outline" size={12} color="white" />
              <Text className="text-white text-xs ml-1">
                Pending: {contacts.filter((c) => c.status === "pending").length}
              </Text>
            </View>
            <View className="bg-white/20 rounded-full px-3 py-1 flex-row items-center">
              <Ionicons name="eye-outline" size={12} color="white" />
              <Text className="text-white text-xs ml-1">
                Read: {contacts.filter((c) => c.status === "read").length}
              </Text>
            </View>
            <View className="bg-white/20 rounded-full px-3 py-1 flex-row items-center">
              <Ionicons name="chatbubble-outline" size={12} color="white" />
              <Text className="text-white text-xs ml-1">
                Replied: {contacts.filter((c) => c.status === "replied").length}
              </Text>
            </View>
            <View className="bg-white/20 rounded-full px-3 py-1 flex-row items-center">
              <Ionicons
                name="checkmark-circle-outline"
                size={12}
                color="white"
              />
              <Text className="text-white text-xs ml-1">
                Resolved:{" "}
                {contacts.filter((c) => c.status === "resolved").length}
              </Text>
            </View>
          </View>
        </View>

        <FlatList
          data={contacts}
          keyExtractor={(item) => item.id}
          renderItem={renderContactItem}
          contentContainerStyle={{
            paddingTop: 16,
            paddingBottom: 20,
            marginBottom: 16,
          }}
          showsVerticalScrollIndicator={false}
        />
      </View>
    </TouchableWithoutFeedback>
  );
}
