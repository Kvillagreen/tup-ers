<?php
// registration.php

date_default_timezone_set('Asia/Manila');
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, GET, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

// Handle preflight requests
if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') {
    exit(0);
}

include '../connection.php';

// Get POST data
$data = json_decode(file_get_contents("php://input"), true);
$tokenId = $data['tokenId'] ?? null;
$schedule = $data['schedule'] ?? null; // Schedule as an array from Angular
$classId = $data['classId'] ?? null; // Schedule as an array from Angular
$facultyId = $data['facultyId'] ?? null;

// Check if classId is provided
if (!$classId) {
    echo json_encode([
        'success' => false,
        'message' => 'Class ID is required',
    ]);
    exit();
}

try {
    // Ensure schedule is an array and encode it into JSON format
    if (is_array($schedule)) {
        $scheduleJson = json_encode($schedule); // Convert array to JSON format
    } else {
        throw new Exception('Schedule must be an array.');
    }

    // Prepare the UPDATE query to store the schedule in JSON format
    $insertPetition = $conn->prepare("UPDATE `tbl_class` SET schedule=? , faculty_id=? WHERE class_id=?");
    $insertPetition->bind_param("sss", $scheduleJson,$facultyId, $classId); // Bind the JSON string and classId

    if ($insertPetition->execute()) {
        echo json_encode([
            'success' => true,
            'message' => 'Schedule has been successfully updated.',
        ]);
    } else {
        echo json_encode([
            'success' => false,
            'message' => 'Failed to update the schedule. Class ID may not exist.',
        ]);
    }

} catch (Exception $e) {
    echo json_encode([
        'success' => false,
        'message' => 'Error: ' . $e->getMessage(),
    ]);
    exit();
} finally {
    $conn->close();
}
?>