const express = require("express");
const router = express.Router();
const Appointment = require("../models/appointment-model");
const isLoggedIn = require("../middlewares/isLoggedIn");
const Prescription = require("../models/prescription-model");
const bookingModel = require("../models/booking-model");
const Vaccine = require("../models/vaccine-model");
const User = require("../models/user-model");
const Message = require("../models/contact-model");
const checkRole = require("../middlewares/checkRole");

router.get("/staff-dashboard", isLoggedIn, async (req, res) => {
  try {
    // Get today's date at midnight to filter today's appointments
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);
    const todayEnd = new Date();
    todayEnd.setHours(23, 59, 59, 999);

    // Fetch today's appointments
    const [todaysAppointments] = await Appointment.getTodaysAppointments(
      todayStart,
      todayEnd
    )

    // Fetch pending appointments
    const [rows] = await Appointment.countPendingAppointments();
    const pendingAppointmentsCount = rows[0].pendingCount;

    // Fetch new messages
    const newMessages = await Message.getAllContacts();
    const newMessagesCount = newMessages.length;

    // Fetch vaccine records (users who have been issued a vaccine)
    const [vaccineRecords] = await bookingModel.getAllBookings();

    // Fetch recent prescriptions
    const [recentPrescriptions] = await Prescription.getRecentPrescriptions();

    res.render("staff/staff-dashboard", {
      user: req.user,
      staff: req.user,
      todaysAppointments,
      pendingAppointmentsCount,
      newMessagesCount,
      newMessages,
      vaccineRecords,
      recentPrescriptions,
      lastLogin: req.user.lastLogin
        ? new Date(req.user.lastLogin).toLocaleString()
        : "First login",
    });
  } catch (err) {
    console.error("Error loading staff dashboard:", err);
    res.status(500).send("Server Error");
  }
});

router.get("/appointments", checkRole(["staff"]), async (req, res) => {
  try {
    // Fetch appointments and populate user details
    let success = req.flash("success");
    const appointment = await Appointment.getAllAppointments();
    res.render("staff/staff-appointments", { user: req.user, appointment, success });
  } catch (error) {
    console.error(error);
    res.status(500).send("Error fetching appointments.");
  }
});

// Add New Vaccine
router.post("/add-vaccine", isLoggedIn, async (req, res) => {
  const { name, description, availableSlots, hospital } = req.body;
  try {
    await Vaccine.createVaccine({
      name,
      description,
      availableSlots,
      hospital,
    });
    res.redirect("/users/vaccines");
  } catch (err) {
    console.error("Error adding vaccine:", err);
    res.status(500).send("Something went wrong");
  }
});

module.exports = router;