const ContactMessage = require('../models/ContactMessage');
const nodemailer = require('nodemailer');

// Create a reusable transporter
const createTransporter = () => {
  return nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });
};

// @desc    Submit a contact message (save to DB + send email)
// @route   POST /api/contact
// @access  Public
exports.submitContactMessage = async (req, res, next) => {
  try {
    const { name, email, subject, message } = req.body;

    if (!name || !email || !message) {
      return res.status(400).json({
        success: false,
        message: 'Name, email, and message are required.',
      });
    }

    // 1. Save to database
    const contactMsg = await ContactMessage.create({
      name,
      email,
      subject: subject || 'General Inquiry',
      message,
    });

    // 2. Send email notification
    let emailSent = false;
    if (process.env.EMAIL_USER && process.env.EMAIL_PASS) {
      try {
        const transporter = createTransporter();

        // Email to admin/owner
        await transporter.sendMail({
          from: `"FarmDirect Support" <${process.env.EMAIL_USER}>`,
          to: process.env.CONTACT_EMAIL || process.env.EMAIL_USER,
          subject: `[FarmDirect Contact] ${subject || 'New Message'} from ${name}`,
          html: `
            <div style="font-family: 'Segoe UI', sans-serif; max-width: 600px; margin: 0 auto; background: #f9fafb; border-radius: 16px; overflow: hidden;">
              <div style="background: linear-gradient(135deg, #0c2313, #1a4a2e); padding: 24px 32px;">
                <h1 style="color: #6ee7b7; margin: 0; font-size: 20px;">🌾 FarmDirect Support</h1>
                <p style="color: #d1d5db; margin: 4px 0 0; font-size: 13px;">New contact form submission</p>
              </div>
              <div style="padding: 24px 32px;">
                <table style="width: 100%; border-collapse: collapse; font-size: 14px;">
                  <tr>
                    <td style="padding: 8px 0; color: #6b7280; font-weight: 600;">Name:</td>
                    <td style="padding: 8px 0; color: #111827;">${name}</td>
                  </tr>
                  <tr>
                    <td style="padding: 8px 0; color: #6b7280; font-weight: 600;">Email:</td>
                    <td style="padding: 8px 0; color: #111827;"><a href="mailto:${email}">${email}</a></td>
                  </tr>
                  <tr>
                    <td style="padding: 8px 0; color: #6b7280; font-weight: 600;">Subject:</td>
                    <td style="padding: 8px 0; color: #111827;">${subject || 'General Inquiry'}</td>
                  </tr>
                </table>
                <div style="margin-top: 16px; padding: 16px; background: white; border-radius: 12px; border: 1px solid #e5e7eb;">
                  <p style="margin: 0 0 4px; color: #6b7280; font-size: 12px; font-weight: 600;">MESSAGE:</p>
                  <p style="margin: 0; color: #1f2937; font-size: 14px; line-height: 1.6;">${message}</p>
                </div>
                <p style="margin-top: 16px; font-size: 12px; color: #9ca3af;">
                  Received at ${new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })}
                </p>
              </div>
            </div>
          `,
        });

        // Auto-reply to the sender
        await transporter.sendMail({
          from: `"FarmDirect Support" <${process.env.EMAIL_USER}>`,
          to: email,
          subject: `We received your message - FarmDirect Support`,
          html: `
            <div style="font-family: 'Segoe UI', sans-serif; max-width: 600px; margin: 0 auto; background: #f9fafb; border-radius: 16px; overflow: hidden;">
              <div style="background: linear-gradient(135deg, #0c2313, #1a4a2e); padding: 24px 32px;">
                <h1 style="color: #6ee7b7; margin: 0; font-size: 20px;">🌾 FarmDirect</h1>
                <p style="color: #d1d5db; margin: 4px 0 0; font-size: 13px;">Thank you for reaching out!</p>
              </div>
              <div style="padding: 24px 32px; font-size: 14px; color: #374151; line-height: 1.7;">
                <p>Hi <strong>${name}</strong>,</p>
                <p>We've received your message and our support team will get back to you within <strong>4 business hours</strong>.</p>
                <p>Here's a copy of what you sent us:</p>
                <div style="padding: 12px 16px; background: white; border-left: 4px solid #059669; border-radius: 8px; margin: 12px 0;">
                  <p style="margin: 0; color: #6b7280; font-size: 12px;"><strong>Subject:</strong> ${subject || 'General Inquiry'}</p>
                  <p style="margin: 8px 0 0; color: #1f2937;">${message}</p>
                </div>
                <p>Meanwhile, you can reach us at <strong>+91 9701264680</strong>.</p>
                <p style="margin-top: 20px;">Best regards,<br/><strong>FarmDirect Support Team</strong><br/>Tamil Nadu</p>
              </div>
            </div>
          `,
        });

        emailSent = true;
      } catch (emailErr) {
        console.error('[Contact] Email send failed:', emailErr.message);
        // Don't fail the request — message is still saved to DB
      }
    }

    res.status(201).json({
      success: true,
      message: 'Your message has been received! We will get back to you shortly.',
      emailSent,
      contactMessage: contactMsg,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get all contact messages (Admin)
// @route   GET /api/contact
// @access  Private (Admin)
exports.getAllContactMessages = async (req, res, next) => {
  try {
    const messages = await ContactMessage.find().sort({ createdAt: -1 });
    res.status(200).json({
      success: true,
      count: messages.length,
      messages,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Update contact message status (Admin)
// @route   PUT /api/contact/:id
// @access  Private (Admin)
exports.updateContactMessage = async (req, res, next) => {
  try {
    const { status, adminNotes } = req.body;
    const msg = await ContactMessage.findByIdAndUpdate(
      req.params.id,
      {
        ...(status && { status }),
        ...(adminNotes !== undefined && { adminNotes }),
        ...(status === 'Replied' && { repliedAt: new Date() }),
      },
      { new: true }
    );

    if (!msg) {
      return res.status(404).json({ success: false, message: 'Message not found' });
    }

    res.status(200).json({ success: true, message: msg });
  } catch (err) {
    next(err);
  }
};

// @desc    Delete contact message (Admin)
// @route   DELETE /api/contact/:id
// @access  Private (Admin)
exports.deleteContactMessage = async (req, res, next) => {
  try {
    const msg = await ContactMessage.findByIdAndDelete(req.params.id);
    if (!msg) {
      return res.status(404).json({ success: false, message: 'Message not found' });
    }
    res.status(200).json({ success: true, message: 'Message deleted' });
  } catch (err) {
    next(err);
  }
};
