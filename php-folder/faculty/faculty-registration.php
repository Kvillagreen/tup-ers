<?php
// registration.php

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, GET, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') {
    exit(0); // Handle preflight request
}

include '../connection.php';

// Get POST data
$data = json_decode(file_get_contents("php://input"), true);
$lastName = $data['lastName'] ?? '';
$firstName = $data['firstName'] ?? '';
$email = $data['email'] ?? '';
$password = $data['password'] ?? '';
$faculty = $data['faculty'] ?? '';
$program = $data['program'] ?? '';
$status = 'pending';
$tokenId = uniqid(); // Generate a unique token ID if not provided
$dateCreated = date('Y-m-d H:i:s');
if (!$lastName || !$firstName || !$email || !$faculty || !$password || !$program) {
    echo json_encode([
        'success' => false,
        'message' => 'All fields are required',
    ]);
    exit();
}

try {
    // Check if the email exists
    $isEmailExist = $conn->prepare("SELECT * FROM `tbl_admin` WHERE `email` = ?");
    $isEmailExist->bind_param("s", $email);
    $isEmailExist->execute();
    $emailResult = $isEmailExist->get_result();


    $isNameExist = $conn->prepare("SELECT * FROM `tbl_admin` WHERE `first_name` = ? AND `last_name` = ?");
    $isNameExist->bind_param("ss", $firstName, $lastName);
    $isNameExist->execute();
    $nameResult = $isNameExist->get_result();

    if ($nameResult && $nameResult->num_rows > 0) {
        echo json_encode([
            'success' => false,
            'message' => 'Name already exist, If you believe this is an error, please contact the registrar for assistance.'
        ]);
        exit();
    }

    if ($emailResult && $emailResult->num_rows > 0) {
        echo json_encode([
            'success' => false,
            'message' => 'Email already exists, please login to your account.'
        ]);
        exit();
    }

    // Hash the password for security
    $hashedPassword = password_hash($password, PASSWORD_DEFAULT);
    $insertQuery = $conn->prepare(
        "INSERT INTO `tbl_admin` (`first_name`, `last_name`, `email`, `password`, `program`, `faculty_type`, `status`, `token_id`, `date_created`) 
        VALUES (?,?,?,?,?,?,?,?,?)"
    );
    $insertQuery->bind_param("sssssssss", $firstName, $lastName, $email, $hashedPassword, $program, $faculty, $status, $tokenId, $dateCreated);

    if ($insertQuery->execute()) {
        echo json_encode([
            'success' => true,
            'message' => 'Registration successful. You can now login your account',
        ]);
    } else {
        throw new Exception('Registration failed. Please try again later.');
    }
} catch (Exception $e) {
    echo json_encode([
        'success' => false,
        'message' => $e->getMessage()
    ]);
} finally {
    // Close the database connection
    $conn->close();
}
?>