const visitProfile = async (req, res) => {
  try {
    const { id } = req.params;
    const viewerId = req.user?.id;

    const user = await User.findById(id).select("-password -email").lean();

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (viewerId && viewerId !== id) {
      await User.findByIdAndUpdate(id, {
        $addToSet: { profileVisitors: viewerId },
      });
    }

    res.status(200).json({ success: true, user });
  } catch (error) {
    console.error("visitProfile error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

module.exports = visitProfile;
