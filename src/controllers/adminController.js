const instructorRequest = require("../models/instructorRequest");
const instructorProfile = require("../models/instructorProfile");

exports.getAllRequests = async (req, res) => {
  try {
    const requests = await instructorRequest.find();
    if (requests.length === 0)
      return res.status(400).json({ message: "No Requests Found" });

    res.status(200).json(requests);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server Error" });
  }
};

exports.getRequest = async (req, res) => {
  try {
    const requestId = req.params.id;
    const request = await instructorRequest.findById(requestId);

    if (!request) return res.status(400).json({ message: "Request No Found!" });
    await request.populate("userId", "name email profileImage");
    res.status(200).json(request);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server Error" });
  }
};
