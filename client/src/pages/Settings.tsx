import { useState } from "react";
import * as React from "react";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Settings as SettingsIcon, Save, MapPin, DollarSign, Mail, Phone, User, BookOpen } from "lucide-react";

export default function Settings() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isEditing, setIsEditing] = useState(false);

  // Form states
  const [firstName, setFirstName] = useState(user?.firstName || "");
  const [lastName, setLastName] = useState(user?.lastName || "");
  const [mobile, setMobile] = useState(user?.mobile || "");
  const [email, setEmail] = useState(user?.email || "");
  const [monthlyFee, setMonthlyFee] = useState("");
  const [subjects, setSubjects] = useState<string[]>([]);
  const [newSubject, setNewSubject] = useState("");
  // Student budget settings
  const [budgetMin, setBudgetMin] = useState("");
  const [budgetMax, setBudgetMax] = useState("");
  const [preferredSubjects, setPreferredSubjects] = useState<string[]>([]);
  const [newPreferredSubject, setNewPreferredSubject] = useState("");

  // Get profile data
  const { data: profileData, isLoading } = useQuery({
    queryKey: ['/api/profile'],
    enabled: !!user,
  });

  // Update state when data is loaded
  React.useEffect(() => {
    if (profileData) {
      const data = profileData as any;
      setFirstName(data.firstName || "");
      setLastName(data.lastName || "");
      setMobile(data.mobile || "");
      setEmail(data.email || "");
      if (user?.userType === "teacher") {
        setMonthlyFee(data.monthlyFee?.toString() || "5000");
        setSubjects(data.subjects || []);
      } else if (user?.userType === "student") {
        setBudgetMin(data.budgetMin?.toString() || "2000");
        setBudgetMax(data.budgetMax?.toString() || "10000");
        setPreferredSubjects(data.preferredSubjects || []);
      }
    }
  }, [profileData, user?.userType]);

  // Update profile mutation
  const updateMutation = useMutation({
    mutationFn: async (data: any) => {
      return apiRequest("PUT", "/api/profile", data);
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Profile updated successfully",
      });
      setIsEditing(false);
      queryClient.invalidateQueries({ queryKey: ['/api/profile'] });
      queryClient.invalidateQueries({ queryKey: ['/api/auth/me'] });
    },
    onError: (error: any) => {
      toast({
        title: "Error", 
        description: error?.message || "Failed to update profile",
        variant: "destructive",
      });
    },
  });

  const addPreferredSubject = () => {
    if (newPreferredSubject.trim() && !preferredSubjects.includes(newPreferredSubject.trim())) {
      setPreferredSubjects([...preferredSubjects, newPreferredSubject.trim()]);
      setNewPreferredSubject("");
    }
  };

  const removePreferredSubject = (subjectToRemove: string) => {
    setPreferredSubjects(preferredSubjects.filter(subject => subject !== subjectToRemove));
  };

  const handleSave = () => {
    const updateData: any = {
      firstName,
      lastName,
      mobile,
      email,
    };

    if (user?.userType === "teacher") {
      updateData.monthlyFee = parseFloat(monthlyFee);
      updateData.subjects = subjects;
    } else if (user?.userType === "student") {
      updateData.budgetMin = parseInt(budgetMin);
      updateData.budgetMax = parseInt(budgetMax);
      updateData.preferredSubjects = preferredSubjects;
    }

    updateMutation.mutate(updateData);
  };

  const addSubject = () => {
    if (newSubject.trim() && !subjects.includes(newSubject.trim())) {
      setSubjects([...subjects, newSubject.trim()]);
      setNewSubject("");
    }
  };

  const removeSubject = (subjectToRemove: string) => {
    setSubjects(subjects.filter(s => s !== subjectToRemove));
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-md border-b border-gray-200/50 sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <SettingsIcon className="w-8 h-8 text-blue-600" />
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
                <p className="text-gray-600">Manage your profile and preferences</p>
              </div>
            </div>
            <Button
              onClick={() => isEditing ? handleSave() : setIsEditing(true)}
              disabled={updateMutation.isPending}
              className="bg-blue-600 hover:bg-blue-700"
            >
              {isEditing ? (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  Save Changes
                </>
              ) : (
                "Edit Profile"
              )}
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="grid gap-6">
          {/* Personal Information */}
          <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center">
                <User className="w-5 h-5 mr-2 text-blue-600" />
                Personal Information
              </CardTitle>
            </CardHeader>
            <CardContent className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">First Name</label>
                <Input
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  disabled={!isEditing}
                  className="bg-gray-50"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Last Name</label>
                <Input
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  disabled={!isEditing}
                  className="bg-gray-50"
                />
              </div>
            </CardContent>
          </Card>

          {/* Contact Information */}
          <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Phone className="w-5 h-5 mr-2 text-green-600" />
                Contact Information
              </CardTitle>
            </CardHeader>
            <CardContent className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">Mobile Number</label>
                <Input
                  value={mobile}
                  onChange={(e) => setMobile(e.target.value)}
                  disabled={!isEditing}
                  className="bg-gray-50"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Email Address</label>
                <Input
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={!isEditing}
                  className="bg-gray-50"
                  type="email"
                />
              </div>
            </CardContent>
          </Card>

          {/* Teacher-specific settings */}
          {user?.userType === "teacher" && (
            <>
              {/* Monthly Fee */}
              <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <DollarSign className="w-5 h-5 mr-2 text-green-600" />
                    Monthly Fee
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div>
                    <label className="block text-sm font-medium mb-2">Fee per Month (₹)</label>
                    <Input
                      value={monthlyFee}
                      onChange={(e) => setMonthlyFee(e.target.value)}
                      disabled={!isEditing}
                      className="bg-gray-50 max-w-md"
                      type="number"
                      placeholder="5000"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      This fee will be displayed to students looking for tutors
                    </p>
                  </div>
                </CardContent>
              </Card>

              {/* Subjects */}
              <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <BookOpen className="w-5 h-5 mr-2 text-purple-600" />
                    Subjects
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex flex-wrap gap-2">
                      {subjects.map((subject, index) => (
                        <Badge
                          key={index}
                          variant="secondary"
                          className="bg-blue-100 text-blue-700 px-3 py-1"
                        >
                          {subject}
                          {isEditing && (
                            <button
                              onClick={() => removeSubject(subject)}
                              className="ml-2 text-blue-500 hover:text-blue-700"
                            >
                              ×
                            </button>
                          )}
                        </Badge>
                      ))}
                    </div>
                    
                    {isEditing && (
                      <div className="flex gap-2 max-w-md">
                        <Input
                          value={newSubject}
                          onChange={(e) => setNewSubject(e.target.value)}
                          placeholder="Add a subject"
                          onKeyPress={(e) => {
                            if (e.key === 'Enter') {
                              e.preventDefault();
                              addSubject();
                            }
                          }}
                        />
                        <Button onClick={addSubject} size="sm">
                          Add
                        </Button>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </>
          )}

          {/* Student-specific settings */}
          {user?.userType === "student" && (
            <>
              {/* Budget Settings */}
              <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <DollarSign className="w-5 h-5 mr-2 text-green-600" />
                    Budget Preferences
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-2">Minimum Budget (₹/month)</label>
                      <Input
                        value={budgetMin}
                        onChange={(e) => setBudgetMin(e.target.value)}
                        disabled={!isEditing}
                        className="bg-gray-50"
                        type="number"
                        placeholder="2000"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">Maximum Budget (₹/month)</label>
                      <Input
                        value={budgetMax}
                        onChange={(e) => setBudgetMax(e.target.value)}
                        disabled={!isEditing}
                        className="bg-gray-50"
                        type="number"
                        placeholder="10000"
                      />
                    </div>
                  </div>
                  <p className="text-xs text-gray-500 mt-2">
                    Teachers within your budget range will be shown first in search results
                  </p>
                </CardContent>
              </Card>

              {/* Preferred Subjects */}
              <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <BookOpen className="w-5 h-5 mr-2 text-purple-600" />
                    Preferred Subjects
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex flex-wrap gap-2">
                      {preferredSubjects.map((subject, index) => (
                        <Badge
                          key={index}
                          variant="secondary"
                          className="bg-purple-100 text-purple-700 px-3 py-1"
                        >
                          {subject}
                          {isEditing && (
                            <button
                              onClick={() => removePreferredSubject(subject)}
                              className="ml-2 text-purple-500 hover:text-purple-700"
                            >
                              ×
                            </button>
                          )}
                        </Badge>
                      ))}
                    </div>
                    
                    {isEditing && (
                      <div className="flex gap-2 max-w-md">
                        <Input
                          value={newPreferredSubject}
                          onChange={(e) => setNewPreferredSubject(e.target.value)}
                          placeholder="Add a preferred subject"
                          onKeyPress={(e) => {
                            if (e.key === 'Enter') {
                              e.preventDefault();
                              addPreferredSubject();
                            }
                          }}
                        />
                        <Button onClick={addPreferredSubject} size="sm">
                          Add
                        </Button>
                      </div>
                    )}
                    <p className="text-xs text-gray-500">
                      Teachers for these subjects will be prioritized in your search results
                    </p>
                  </div>
                </CardContent>
              </Card>
            </>
          )}

          {/* Location Status */}
          <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center">
                <MapPin className="w-5 h-5 mr-2 text-red-600" />
                Location Settings
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">
                    Location Status: {(user as any)?.isLocationVerified ? (
                      <span className="text-green-600">Verified</span>
                    ) : (
                      <span className="text-red-600">Not Set</span>
                    )}
                  </p>
                  {(user as any)?.city && (
                    <p className="text-sm text-gray-600">
                      Current: {(user as any).city}, {(user as any).state}
                    </p>
                  )}
                </div>
                <Button variant="outline" size="sm" asChild>
                  <a href="/settings/location">
                    Set Location
                  </a>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}