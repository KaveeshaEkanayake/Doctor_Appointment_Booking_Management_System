import React, { useState, useEffect } from "react";
import axios from "axios";
import DoctorLayout from "../layouts/DoctorLayout";
import { FiCamera } from "react-icons/fi";

const API_URL = import.meta.env.VITE_API_URL;

const SPECIALISATIONS = [
  "General Surgery", "Cardiology", "Dermatology", "Neurology",
  "Orthopedics", "Pediatrics", "Psychiatry", "Ophthalmology",
  "ENT", "Gynecology", "Urology", "Oncology", "Radiology",
  "Anesthesiology", "General Practice",
];

export default function DoctorProfilePage() {
  const [profile, setProfile] = useState({
    firstName: "", lastName: "", specialisation: "",
    status: "", profileStatus: "", profilePhoto: "",
    bio: "", qualifications: "", experience: "", consultationFee: "",
  });

  const [originalProfile, setOriginalProfile] = useState(null);
  const [loading,         setLoading]         = useState(true);
  const [saving,          setSaving]          = useState(false);
  const [statusMessage,   setStatusMessage]   = useState("");
  const [statusType,      setStatusType]      = useState("");
  const [errors,          setErrors]          = useState({});
  const [showPhotoModal,  setShowPhotoModal]  = useState(false);
  const [photoUrl,        setPhotoUrl]        = useState("");

  const token = localStorage.getItem("token");

  // Is the form editable?
  const isAccountApproved  = profile.status === "APPROVED";
  const isUnderReview      = profile.profileStatus === "PENDING_REVIEW";
  const isProfileApproved  = profile.profileStatus === "APPROVED";
  const isFormLocked       = !isAccountApproved || isUnderReview;

  useEffect(() => { fetchProfile(); }, []);

  const fetchProfile = async () => {
    try {
      const res = await axios.get(`${API_URL}/api/doctor/profile`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const doctor = res.data.doctor;
      const profileData = {
        firstName:       doctor.firstName       ?? "",
        lastName:        doctor.lastName        ?? "",
        specialisation:  doctor.specialisation  ?? "",
        status:          doctor.status          ?? "",
        profileStatus:   doctor.profileStatus   ?? "NOT_SUBMITTED",
        profilePhoto:    doctor.profilePhoto    ?? "",
        bio:             doctor.bio             ?? "",
        qualifications:  doctor.qualifications  ?? "",
        experience:      doctor.experience      ?? "",
        consultationFee: doctor.consultationFee ?? "",
      };
      setProfile(profileData);
      setOriginalProfile(profileData);
    } catch {
      setStatusMessage("Failed to load profile");
      setStatusType("error");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    if (isFormLocked) return;
    const { name, value } = e.target;
    setProfile((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const handleDiscard = () => {
    if (originalProfile) {
      setProfile(originalProfile);
      setStatusMessage("");
      setErrors({});
    }
  };

  const validateForm = () => {
    const newErrors = {};
    if (!profile.bio?.trim())            newErrors.bio            = "Bio is required";
    if (!profile.qualifications?.trim()) newErrors.qualifications = "Qualifications is required";
    if (!profile.experience?.trim())     newErrors.experience     = "Experience is required";
    if (!profile.specialisation?.trim()) newErrors.specialisation = "Specialisation is required";
    if (profile.consultationFee === "" || profile.consultationFee === null) {
      newErrors.consultationFee = "Consultation fee is required";
    } else if (parseFloat(profile.consultationFee) < 0) {
      newErrors.consultationFee = "Consultation fee must be a non-negative number";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setStatusMessage("");
    if (!validateForm()) {
      setStatusMessage("Please fill in all required fields");
      setStatusType("error");
      return;
    }
    setSaving(true);
    try {
      const res = await axios.put(
        `${API_URL}/api/doctor/profile`,
        {
          bio:             profile.bio,
          qualifications:  profile.qualifications,
          experience:      profile.experience,
          consultationFee: parseFloat(profile.consultationFee),
          specialisation:  profile.specialisation,
          profilePhoto:    profile.profilePhoto || undefined,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      const updated = res.data.doctor;
      const updatedData = { ...profile, profileStatus: updated.profileStatus };
      setProfile(updatedData);
      setOriginalProfile(updatedData);
      setErrors({});
      setStatusMessage("Profile submitted for review. You'll be notified once approved.");
      setStatusType("success");
    } catch (err) {
      setStatusMessage(
        err.response?.data?.message || "Failed to update profile. Please try again."
      );
      setStatusType("error");
    } finally {
      setSaving(false);
    }
  };

  const handlePhotoSubmit = () => {
    if (photoUrl.trim()) {
      setProfile((prev) => ({ ...prev, profilePhoto: photoUrl.trim() }));
    }
    setShowPhotoModal(false);
    setPhotoUrl("");
  };

  if (loading) {
    return (
      <DoctorLayout>
        <div className="flex items-center justify-center h-full">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
        </div>
      </DoctorLayout>
    );
  }

  return (
    <DoctorLayout>
      <div className="p-4 sm:p-6 lg:p-8 max-w-4xl mx-auto">

        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start gap-4 mb-6 sm:mb-8">
          <div>
            <p className="text-gray-500 text-sm">Hi, Dr. {profile.firstName}</p>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Profile</h1>
          </div>
          <div className="hidden sm:flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gray-200 overflow-hidden">
              {profile.profilePhoto ? (
                <img src={profile.profilePhoto} alt="Profile" className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-gray-400 text-sm font-medium">
                  {profile.firstName?.[0]}{profile.lastName?.[0]}
                </div>
              )}
            </div>
            <span className="text-sm font-medium text-gray-700">Dr. {profile.firstName}</span>
          </div>
        </div>

        {/* ── Status Banners ── */}

        {/* Account pending */}
        {profile.status === "PENDING" && (
          <div className="mb-6 p-4 rounded-xl bg-yellow-50 border border-yellow-200 text-yellow-700 text-sm font-medium">
            ⏳ Your account is pending admin approval. You can set up your profile once approved.
          </div>
        )}

        {/* Account rejected */}
        {profile.status === "REJECTED" && (
          <div className="mb-6 p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm font-medium">
            ❌ Your account has been rejected. Please contact support.
          </div>
        )}

        {/* Account approved — show profile status banners */}
        {profile.status === "APPROVED" && (
          <>
            {profile.profileStatus === "NOT_SUBMITTED" && (
              <div className="mb-6 p-4 rounded-xl bg-blue-50 border border-blue-200 text-blue-700 text-sm font-medium">
                ✏️ Your account is approved. Please complete your profile and submit it for review.
              </div>
            )}
            {profile.profileStatus === "PENDING_REVIEW" && (
              <div className="mb-6 p-4 rounded-xl bg-yellow-50 border border-yellow-200 text-yellow-700 text-sm font-medium">
                ⏳ Your profile is under review by admin. You'll be notified once approved.
              </div>
            )}
            {profile.profileStatus === "APPROVED" && (
              <div className="mb-6 p-4 rounded-xl bg-green-50 border border-green-200 text-green-700 text-sm font-medium">
                ✅ Your profile is live and visible to patients.
              </div>
            )}
            {profile.profileStatus === "REJECTED" && (
              <div className="mb-6 p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm font-medium">
                ❌ Your profile was rejected. Please update your details and re-submit.
              </div>
            )}
          </>
        )}

        {/* Profile form */}
        <form onSubmit={handleSave}>
          <div className={`bg-white rounded-2xl border border-gray-200 p-4 sm:p-6 lg:p-8 ${isFormLocked ? "opacity-70" : ""}`}>

            {/* Photo + Name */}
            <div className="flex flex-col sm:flex-row items-center gap-4 sm:gap-6 mb-6 pb-6 border-b border-gray-100">
              <div className="relative">
                <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-blue-50 border-2 border-blue-100 overflow-hidden">
                  {profile.profilePhoto ? (
                    <img src={profile.profilePhoto} alt="Profile" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-blue-400 text-xl font-semibold">
                      {profile.firstName?.[0]}{profile.lastName?.[0]}
                    </div>
                  )}
                </div>
                {!isFormLocked && (
                  <button
                    type="button"
                    onClick={() => setShowPhotoModal(true)}
                    className="absolute bottom-0 right-0 w-7 h-7 sm:w-8 sm:h-8 bg-blue-600 rounded-full flex items-center justify-center text-white shadow-md hover:bg-blue-700 transition"
                  >
                    <FiCamera className="text-xs sm:text-sm" />
                  </button>
                )}
              </div>
              <div className="text-center sm:text-left">
                <h2 className="text-lg sm:text-xl font-semibold text-gray-900">
                  Dr. {profile.firstName} {profile.lastName}
                </h2>
                <p className="text-gray-500 text-sm">{profile.specialisation}</p>
                {!isFormLocked && (
                  <button
                    type="button"
                    onClick={() => setShowPhotoModal(true)}
                    className="mt-2 text-blue-600 text-sm font-medium hover:text-blue-700 transition"
                  >
                    Change Photo
                  </button>
                )}
              </div>
            </div>

            {/* Bio */}
            <div className="mb-6">
              <label htmlFor="bio" className="block text-sm font-semibold text-gray-900 mb-2">
                Bio <span className="text-red-500">*</span>
              </label>
              <textarea
                id="bio" name="bio" value={profile.bio} onChange={handleChange}
                placeholder="Write a brief professional summary..."
                rows={4} disabled={isFormLocked}
                className={`w-full border rounded-xl px-4 py-3 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-400 resize-none bg-gray-50 ${
                  errors.bio ? "border-red-400" : "border-gray-200"
                } ${isFormLocked ? "cursor-not-allowed" : ""}`}
              />
              {errors.bio && <p className="text-red-500 text-xs mt-1">{errors.bio}</p>}
            </div>

            {/* Qualifications + Experience */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 mb-6">
              <div>
                <label htmlFor="qualifications" className="block text-sm font-semibold text-gray-900 mb-2">
                  Qualifications <span className="text-red-500">*</span>
                </label>
                <input
                  id="qualifications" type="text" name="qualifications"
                  value={profile.qualifications} onChange={handleChange}
                  placeholder="e.g. MBBS, MS - General Surgery" disabled={isFormLocked}
                  className={`w-full border rounded-xl px-4 py-3 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-400 bg-gray-50 ${
                    errors.qualifications ? "border-red-400" : "border-gray-200"
                  } ${isFormLocked ? "cursor-not-allowed" : ""}`}
                />
                {errors.qualifications && <p className="text-red-500 text-xs mt-1">{errors.qualifications}</p>}
              </div>
              <div>
                <label htmlFor="experience" className="block text-sm font-semibold text-gray-900 mb-2">
                  Experience (Years) <span className="text-red-500">*</span>
                </label>
                <input
                  id="experience" type="text" name="experience"
                  value={profile.experience} onChange={handleChange}
                  placeholder="e.g. 12" disabled={isFormLocked}
                  className={`w-full border rounded-xl px-4 py-3 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-400 bg-gray-50 ${
                    errors.experience ? "border-red-400" : "border-gray-200"
                  } ${isFormLocked ? "cursor-not-allowed" : ""}`}
                />
                {errors.experience && <p className="text-red-500 text-xs mt-1">{errors.experience}</p>}
              </div>
            </div>

            {/* Specialisation + Fee */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 mb-8">
              <div>
                <label htmlFor="specialisation" className="block text-sm font-semibold text-gray-900 mb-2">
                  Specialization <span className="text-red-500">*</span>
                </label>
                <select
                  id="specialisation" name="specialisation"
                  value={profile.specialisation} onChange={handleChange}
                  disabled={isFormLocked}
                  className={`w-full border rounded-xl px-4 py-3 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-400 bg-gray-50 appearance-none ${
                    errors.specialisation ? "border-red-400" : "border-gray-200"
                  } ${isFormLocked ? "cursor-not-allowed" : ""}`}
                >
                  <option value="">Select specialisation</option>
                  {SPECIALISATIONS.map((spec) => (
                    <option key={spec} value={spec}>{spec}</option>
                  ))}
                </select>
                {errors.specialisation && <p className="text-red-500 text-xs mt-1">{errors.specialisation}</p>}
              </div>
              <div>
                <label htmlFor="consultationFee" className="block text-sm font-semibold text-gray-900 mb-2">
                  Consultation Fee (Rs) <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm text-gray-400">Rs</span>
                  <input
                    id="consultationFee" type="number" name="consultationFee"
                    value={profile.consultationFee} onChange={handleChange}
                    placeholder="150" min="0" disabled={isFormLocked}
                    className={`w-full border rounded-xl pl-10 pr-4 py-3 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-400 bg-gray-50 ${
                      errors.consultationFee ? "border-red-400" : "border-gray-200"
                    } ${isFormLocked ? "cursor-not-allowed" : ""}`}
                  />
                </div>
                {errors.consultationFee && <p className="text-red-500 text-xs mt-1">{errors.consultationFee}</p>}
              </div>
            </div>

            {/* Buttons */}
            <div className="flex flex-col-reverse sm:flex-row justify-end gap-3 pt-6 border-t border-gray-100">
              {!isFormLocked && (
                <button
                  type="button" onClick={handleDiscard}
                  className="w-full sm:w-auto px-6 py-2.5 border border-gray-300 rounded-xl text-sm font-medium text-gray-700 hover:bg-gray-50 transition"
                >
                  Discard Changes
                </button>
              )}
              <button
                type="submit"
                disabled={isFormLocked || saving}
                className={`w-full sm:w-auto px-6 py-2.5 rounded-xl text-sm font-medium transition flex items-center justify-center gap-2
                  ${isFormLocked
                    ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                    : "bg-blue-600 text-white hover:bg-blue-700"
                  }`}
              >
                {saving ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
                ) : (
                  <>
                    <span>📋</span>
                    {isProfileApproved ? "Re-submit for Review" : "Submit for Review"}
                  </>
                )}
              </button>
            </div>
          </div>
        </form>

        {/* Photo Modal */}
        {showPhotoModal && (
          <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-xl">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Update Profile Photo</h3>
              <label htmlFor="photoUrl" className="block text-sm font-medium text-gray-700 mb-2">
                Image URL
              </label>
              <input
                id="photoUrl" type="url" value={photoUrl}
                onChange={(e) => setPhotoUrl(e.target.value)}
                placeholder="https://example.com/photo.jpg"
                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-400 bg-gray-50 mb-4"
              />
              <div className="flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => { setShowPhotoModal(false); setPhotoUrl(""); }}
                  className="px-4 py-2 border border-gray-300 rounded-xl text-sm font-medium text-gray-700 hover:bg-gray-50 transition"
                >
                  Cancel
                </button>
                <button
                  type="button" onClick={handlePhotoSubmit}
                  className="px-4 py-2 bg-blue-600 text-white rounded-xl text-sm font-medium hover:bg-blue-700 transition"
                >
                  Save Photo
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Status Message */}
        {statusMessage && (
          <div className={`mt-6 p-4 rounded-xl text-sm text-center font-medium ${
            statusType === "success"
              ? "bg-green-50 border border-green-200 text-green-700"
              : "bg-red-50 border border-red-200 text-red-700"
          }`}>
            {statusType === "success" && <span className="mr-2">✅</span>}
            {statusMessage}
          </div>
        )}
      </div>
    </DoctorLayout>
  );
}