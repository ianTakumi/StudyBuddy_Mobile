import client from "@/utils/axiosInstance";
import { Feather, Ionicons, MaterialIcons } from "@expo/vector-icons";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Keyboard,
  Text,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from "react-native";

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
        return "bg-amber-500";
      case "read":
        return "bg-blue-500";
      case "replied":
        return "bg-purple-500";
      case "resolved":
        return "bg-emerald-500";
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
          <View className="flex-row items-center bg-emerald-50 rounded-2xl p-3 border-2 border-emerald-200">
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
      <View className="flex-row items-center bg-emerald-50 rounded-2xl p-3 mb-2">
        <View className="mr-2">{icon}</View>
        <Text className="text-gray-700 flex-1">{contact[field]}</Text>
      </View>
    );
  };

  const renderContactItem = ({ item }) => {
    const isEditing = editingId === item.id;

    return (
      <View
        className="bg-white rounded-3xl mx-4 mb-4 overflow-hidden"
        style={{
          shadowColor: "#10B981",
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.1,
          shadowRadius: 16,
          elevation: 5,
        }}
      >
        {/* Status Bar */}
        <View
          className={`${getStatusColor(item.status)} px-4 py-2 flex-row justify-between items-center`}
        >
          <Text className="text-white text-xs font-bold uppercase">
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

        <View className="p-5">
          {isEditing ? (
            <>
              <View className="flex-row justify-between items-start mb-4">
                <View className="flex-row items-center flex-1">
                  <View className="w-12 h-12 rounded-full bg-emerald-500 items-center justify-center mr-3">
                    <Text className="text-white text-xl font-bold">
                      {editingData.first_name?.charAt(0)}
                      {editingData.last_name?.charAt(0)}
                    </Text>
                  </View>
                  <View className="flex-1">
                    <View className="flex-row gap-2">
                      <TextInput
                        className="flex-1 text-lg font-bold text-gray-800 border-b-2 border-emerald-200"
                        value={editingData.first_name}
                        onChangeText={(text) =>
                          setEditingData({ ...editingData, first_name: text })
                        }
                        placeholder="First Name"
                      />
                      <TextInput
                        className="flex-1 text-lg font-bold text-gray-800 border-b-2 border-emerald-200"
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
                <Ionicons name="mail-outline" size={20} color="#10B981" />,
                "email",
              )}
              {renderEditableField(
                item,
                "phone",
                "Phone",
                <Ionicons name="call-outline" size={20} color="#10B981" />,
                "phone",
              )}
              {renderEditableField(
                item,
                "subject",
                "Subject",
                <Ionicons name="bookmark-outline" size={20} color="#10B981" />,
              )}

              <View className="mb-2">
                <View className="bg-emerald-50 rounded-2xl p-3 border-2 border-emerald-200">
                  <View className="flex-row items-start">
                    <Ionicons
                      name="chatbubble-outline"
                      size={20}
                      color="#10B981"
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
                <Text className="text-gray-700 font-semibold mb-2 ml-1">
                  Status
                </Text>
                <View className="flex-row gap-2">
                  {["pending", "read", "replied", "resolved"].map((status) => (
                    <TouchableOpacity
                      key={status}
                      onPress={() => setEditingData({ ...editingData, status })}
                      className={`flex-1 py-2.5 rounded-full ${
                        editingData.status === status
                          ? "bg-emerald-500"
                          : "bg-emerald-50"
                      }`}
                    >
                      <Text
                        className={`text-center text-sm font-semibold ${
                          editingData.status === status
                            ? "text-white"
                            : "text-emerald-700"
                        }`}
                      >
                        {status.charAt(0).toUpperCase() + status.slice(1)}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              <View className="flex-row gap-3 mt-3">
                <TouchableOpacity
                  onPress={cancelEditing}
                  className="flex-1 bg-gray-200 py-3 rounded-2xl"
                >
                  <Text className="text-center text-gray-700 font-semibold">
                    Cancel
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => saveContact(item.id)}
                  disabled={updating}
                  className="flex-1 bg-emerald-500 py-3 rounded-2xl"
                  style={{
                    shadowColor: "#10B981",
                    shadowOffset: { width: 0, height: 4 },
                    shadowOpacity: 0.3,
                    shadowRadius: 12,
                    elevation: 5,
                  }}
                >
                  {updating ? (
                    <ActivityIndicator size="small" color="white" />
                  ) : (
                    <Text className="text-center text-white font-bold">
                      Save
                    </Text>
                  )}
                </TouchableOpacity>
              </View>
            </>
          ) : (
            <>
              <View className="flex-row justify-between items-start mb-3">
                <View className="flex-row items-center flex-1">
                  <View className="w-12 h-12 rounded-full bg-emerald-100 items-center justify-center mr-3">
                    <Text className="text-emerald-600 text-xl font-bold">
                      {item.first_name.charAt(0)}
                      {item.last_name.charAt(0)}
                    </Text>
                  </View>
                  <View className="flex-1">
                    <Text className="text-lg font-bold text-gray-800">
                      {item.first_name} {item.last_name}
                    </Text>
                    <Text className="text-xs text-gray-400">
                      ID: {item.id.slice(0, 8)}...
                    </Text>
                  </View>
                </View>
                <TouchableOpacity
                  onPress={() => startEditing(item)}
                  className="w-9 h-9 bg-emerald-100 rounded-full items-center justify-center"
                >
                  <Feather name="edit-2" size={16} color="#10B981" />
                </TouchableOpacity>
              </View>

              <View className="gap-2 mt-2">
                <View className="flex-row items-center bg-emerald-50 rounded-2xl p-3">
                  <Ionicons
                    name="mail-outline"
                    size={20}
                    color="#10B981"
                    className="mr-2"
                  />
                  <Text className="text-gray-700 flex-1">{item.email}</Text>
                </View>

                <View className="flex-row items-center bg-emerald-50 rounded-2xl p-3">
                  <Ionicons
                    name="call-outline"
                    size={20}
                    color="#10B981"
                    className="mr-2"
                  />
                  <Text className="text-gray-700">{item.phone}</Text>
                </View>

                <View className="flex-row items-center bg-emerald-50 rounded-2xl p-3 border-2 border-emerald-200">
                  <Ionicons
                    name="bookmark-outline"
                    size={20}
                    color="#10B981"
                    className="mr-2"
                  />
                  <Text className="text-gray-700 font-semibold flex-1">
                    {item.subject}
                  </Text>
                </View>

                <View className="bg-emerald-50 rounded-2xl p-3 mt-1">
                  <View className="flex-row items-start">
                    <Ionicons
                      name="chatbubble-outline"
                      size={20}
                      color="#10B981"
                      className="mr-2"
                    />
                    <Text className="text-gray-700 flex-1">{item.message}</Text>
                  </View>
                </View>

                <View className="flex-row justify-between items-center mt-2">
                  <View className="flex-row items-center">
                    <View className="w-5 h-5 bg-emerald-100 rounded-full items-center justify-center mr-1.5">
                      <Ionicons name="time-outline" size={10} color="#10B981" />
                    </View>
                    <Text className="text-xs text-gray-400">
                      {new Date(item.created_at).toLocaleDateString()} at{" "}
                      {new Date(item.created_at).toLocaleTimeString()}
                    </Text>
                  </View>
                  {item.status !== "resolved" && (
                    <TouchableOpacity
                      onPress={() =>
                        updateStatus(item.id, getNextStatus(item.status))
                      }
                      className="bg-emerald-500 px-4 py-2 rounded-full flex-row items-center"
                      style={{
                        shadowColor: "#10B981",
                        shadowOffset: { width: 0, height: 4 },
                        shadowOpacity: 0.2,
                        shadowRadius: 8,
                        elevation: 3,
                      }}
                    >
                      <Ionicons name="refresh" size={12} color="white" />
                      <Text className="text-white text-xs font-semibold ml-1.5">
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
      <View className="flex-1 justify-center items-center bg-emerald-50">
        <View className="relative">
          <ActivityIndicator size="large" color="#10B981" />
          <View className="absolute -top-4 -right-4 w-8 h-8 bg-emerald-200 rounded-full opacity-50" />
          <View className="absolute -bottom-2 -left-2 w-6 h-6 bg-emerald-300 rounded-full opacity-40" />
        </View>
        <Text className="mt-4 text-emerald-600 font-medium">
          Loading contacts...
        </Text>
      </View>
    );
  }

  if (error) {
    return (
      <View className="flex-1 justify-center items-center bg-emerald-50">
        <View
          className="bg-white rounded-3xl p-8 mx-4 items-center relative overflow-hidden"
          style={{
            shadowColor: "#EF4444",
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.1,
            shadowRadius: 16,
            elevation: 5,
          }}
        >
          <View className="absolute -top-6 -right-6 w-16 h-16 bg-red-50 rounded-full" />
          <View className="w-16 h-16 bg-red-100 rounded-full items-center justify-center mb-4">
            <MaterialIcons name="error-outline" size={32} color="#EF4444" />
          </View>
          <Text className="text-gray-800 text-lg font-bold text-center">
            {error}
          </Text>
          <TouchableOpacity
            onPress={fetchContacts}
            className="mt-4 bg-emerald-500 px-6 py-3 rounded-2xl"
            style={{
              shadowColor: "#10B981",
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.3,
              shadowRadius: 12,
              elevation: 5,
            }}
          >
            <Text className="text-white font-bold text-center">Retry</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <View className="flex-1 bg-emerald-50">
        {/* Header */}
        <View
          className="w-full pt-16 pb-8 px-6 bg-emerald-500"
          style={{
            borderBottomLeftRadius: 40,
            borderBottomRightRadius: 40,
            shadowColor: "#10B981",
            shadowOffset: { width: 0, height: 10 },
            shadowOpacity: 0.3,
            shadowRadius: 20,
            elevation: 10,
          }}
        >
          <View className="absolute top-8 left-6 w-16 h-16 bg-emerald-400/30 rounded-full" />
          <View className="absolute top-20 right-10 w-24 h-24 bg-emerald-400/20 rounded-full" />
          <View className="absolute bottom-4 left-20 w-12 h-12 bg-emerald-300/40 rounded-full" />

          <View className="flex-row justify-between items-center mb-3">
            <Text className="text-3xl font-bold text-white">Contacts</Text>
            <MaterialIcons name="contacts" size={32} color="white" />
          </View>
          <Text className="text-emerald-100 text-base">
            Total: {contacts.length} contact{contacts.length !== 1 ? "s" : ""}
          </Text>
          <View className="flex-row mt-3 flex-wrap gap-2">
            <View className="bg-white/20 rounded-full px-3 py-1.5 flex-row items-center">
              <Ionicons name="time-outline" size={12} color="white" />
              <Text className="text-white text-xs font-medium ml-1">
                Pending: {contacts.filter((c) => c.status === "pending").length}
              </Text>
            </View>
            <View className="bg-white/20 rounded-full px-3 py-1.5 flex-row items-center">
              <Ionicons name="eye-outline" size={12} color="white" />
              <Text className="text-white text-xs font-medium ml-1">
                Read: {contacts.filter((c) => c.status === "read").length}
              </Text>
            </View>
            <View className="bg-white/20 rounded-full px-3 py-1.5 flex-row items-center">
              <Ionicons name="chatbubble-outline" size={12} color="white" />
              <Text className="text-white text-xs font-medium ml-1">
                Replied: {contacts.filter((c) => c.status === "replied").length}
              </Text>
            </View>
            <View className="bg-white/20 rounded-full px-3 py-1.5 flex-row items-center">
              <Ionicons
                name="checkmark-circle-outline"
                size={12}
                color="white"
              />
              <Text className="text-white text-xs font-medium ml-1">
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
          contentContainerStyle={{ paddingTop: 20, paddingBottom: 100 }}
          showsVerticalScrollIndicator={false}
        />
      </View>
    </TouchableWithoutFeedback>
  );
}
