<?php
// login.php

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, GET, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

// Handle preflight requests
if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') {
    exit(0);
}

include '../connection.php'; // Include your database connection

// Get POST data
$data = json_decode(file_get_contents("php://input"), true);
$email = $data['email'] ?? ''; // Input can be email or username
$tokenId = $data['tokenId'] ?? '';
$facultyId = $data['facultyId'] ?? '';

// Validate input
if (!$email || !$tokenId || !$facultyId) {
    echo json_encode(['success' => false, 'message' => 'All fields are required']);
    http_response_code(400); // Bad Request
    exit;
}

// Determine if input is email or username
$sql = "SELECT * FROM tbl_admin WHERE faculty_id = ? AND email = ? AND  token_id = ?";
$stmt = $conn->prepare($sql);
$stmt->bind_param("sss", $facultyId, $email, $tokenId);
$stmt->execute();
$result = $stmt->get_result();

// Check if user exists
if ($result->num_rows > 0) {
    echo json_encode(['success' => true, 'message' => 'token id and user exist']);
} else {
    echo json_encode(['success' => false, 'message' => 'User not found']);
}

// Close database connection
$stmt->close();
$conn->close();
