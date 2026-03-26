const Group = require("../models/group")
const User = require("../models/user")

//CREATE GROUP 
exports.createGroup = async (req, res) => {
  try {
    const { name, type } = req.body

    if (!name) {
      return res.status(400).json({ message: "Group name is required" })
    }

    const group = await Group.create({
      name,
      type: type || "general",
      createdBy: req.user.id,
      members: [req.user.id]    // creator auto-added as first member
    })

    const populated = await Group.findById(group._id)
      .populate("createdBy", "name email")
      .populate("members", "name email")

    res.status(201).json({
      message: "Group created successfully",
      group: populated
    })

  } catch (error) {
    console.error(error)
    res.status(500).json({ message: "Server error" })
  }
}

//  GET MY GROUPS 
exports.getMyGroups = async (req, res) => {
  try {
    const groups = await Group.find({ 
      members: req.user.id,
      isActive: true
    })
      .populate("createdBy", "name email")
      .populate("members", "name email")
      .sort({ updatedAt: -1 })

    res.status(200).json({ 
      count: groups.length,
      groups 
    })

  } catch (error) {
    console.error(error)
    res.status(500).json({ message: "Server error" })
  }
}

//  GET SINGLE GROUP 
exports.getGroup = async (req, res) => {
  try {
    const group = await Group.findById(req.params.id)
      .populate("createdBy", "name email")
      .populate("members", "name email")

    if (!group) {
      return res.status(404).json({ message: "Group not found" })
    }

    // Check if user is a member
    const isMember = group.members.some(
      member => member._id.toString() === req.user.id
    )

    if (!isMember) {
      return res.status(403).json({ 
        message: "Forbidden — you are not a member of this group" 
      })
    }

    const isAdmin = group.createdBy._id.toString() === req.user.id

    res.status(200).json({ group, isAdmin })

  } catch (error) {
    console.error(error)
    res.status(500).json({ message: "Server error" })
  }
}

//  ADD MEMBER 
exports.addMember = async (req, res) => {
  try {
    const { email } = req.body

    if (!email) {
      return res.status(400).json({ message: "Email is required" })
    }

    const group = await Group.findById(req.params.id)
    if (!group) {
      return res.status(404).json({ message: "Group not found" })
    }

    // Only admin can add members
    if (group.createdBy.toString() !== req.user.id) {
      return res.status(403).json({ 
        message: "Only the group admin can add members" 
      })
    }

    // Find user by email
    const userToAdd = await User.findOne({ email: email.toLowerCase() })
    if (!userToAdd) {
      return res.status(404).json({ 
        message: "No SplitSafe account found with that email" 
      })
    }

    // Check if already a member
    const alreadyMember = group.members.some(
      memberId => memberId.toString() === userToAdd._id.toString()
    )

    if (alreadyMember) {
      return res.status(400).json({ 
        message: "User is already a member of this group" 
      })
    }

    group.members.push(userToAdd._id)
    await group.save()

    const updated = await Group.findById(group._id)
      .populate("createdBy", "name email")
      .populate("members", "name email")

    res.status(200).json({
      message: `${userToAdd.name} added to group successfully`,
      group: updated
    })

  } catch (error) {
    console.error(error)
    res.status(500).json({ message: "Server error" })
  }
}

//  LEAVE GROUP 
exports.leaveGroup = async (req, res) => {
  try {
    const group = await Group.findById(req.params.id)
    if (!group) {
      return res.status(404).json({ message: "Group not found" })
    }

    if (group.createdBy.toString() === req.user.id) {
      return res.status(400).json({ 
        message: "Admin cannot leave — delete the group instead" 
      })
    }

    group.members = group.members.filter(
      memberId => memberId.toString() !== req.user.id
    )
    await group.save()

    res.status(200).json({ message: "You have left the group" })

  } catch (error) {
    console.error(error)
    res.status(500).json({ message: "Server error" })
  }
}