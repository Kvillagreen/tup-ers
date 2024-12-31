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
$studentId = $data['studentId'] ?? '';
$classId = $data['classId'] ?? '';
$date = date('Y-m-d');
$time = date('h:i A');
$status = 'pending';
$petitionTracker = json_encode([
    [
        'receivedBy' => 'Department Head',
        'date' => $date,
        'time' => $time,
        'remarks' => 'unread',
    ]
]);


if (!$studentId) {
    echo json_encode([
        'success' => false,
        'message' => 'All fields are required',
    ]);
    exit();
}

try {
    // Check if the student has already petitioned for the class
    $checkStudentPetition = $conn->prepare("SELECT * FROM `tbl_petition` WHERE `student_id` = ? AND `class_id` = ?");
    $checkStudentPetition->bind_param("ss", $studentId, $classId);
    $checkStudentPetition->execute();
    $studentPetitionResult = $checkStudentPetition->get_result();

    if ($studentPetitionResult && $studentPetitionResult->num_rows > 0) {
        echo json_encode([
            'success' => false,
            'message' => 'You already applied in this petition!'
        ]);
        exit();
    }

    // Fetch petition count for the class
    $fetchPetition = $conn->prepare("SELECT * FROM `tbl_petition` WHERE `class_id` = ?");
    $fetchPetition->bind_param("s", $classId);
    $fetchPetition->execute();
    $petitionResult = $fetchPetition->get_result();
    $length = $petitionResult->num_rows;

    if ($length > 30) {
        // Create a new class if petitions exceed limit
        $fetchClassDetails = $conn->prepare("SELECT * FROM `tbl_class` WHERE `class_id` = ?");
        $fetchClassDetails->bind_param("s", $classId);
        $fetchClassDetails->execute();
        $classDetailsResult = $fetchClassDetails->get_result();

        if ($classDetailsResult->num_rows > 0) {
            $classData = $classDetailsResult->fetch_assoc();
            $subjectName = $classData['subject_name'] ?? '';
            $subjectCode = $classData['subject_code'] ?? '';
            $program = $classData['program'] ?? '';
            $units = $classData['units'] ?? '';
            $facultyId = $classData['faculty_id'] ?? '';
            $status = 'pending';
            $dateCreated = date('Y-m-d H:i:s');
            $schedule = '[{}]';

            $classQuery = $conn->prepare(
                "INSERT INTO `tbl_class` (`subject_code`, `subject_name`, `faculty_id`, `status`, `schedule`, `program`, `units`, `date_created`) 
                VALUES (?,?,?,?,?,?,?,?)"
            );
            $classQuery->bind_param("ssssssss", $subjectCode, $subjectName, $facultyId, $status, $schedule, $program, $units, $dateCreated);
            $classQuery->execute();

            $classId = strval($conn->insert_id);
        }
    }

    // Add a petition for the class
    $petitionQuery = $conn->prepare(
        "INSERT INTO `tbl_petition` (`class_id`, `student_id`, `status`, `petition_tracker`, `date_created`) 
        VALUES (?,?,?,?,?)"
    );
    $petitionQuery->bind_param("sssss", $classId, $studentId, $status, $petitionTracker, $date);

    if ($petitionQuery->execute()) {
        echo json_encode([
            'success' => true,
            'message' => 'Application Complete',
        ]);
    } else {
        throw new Exception('Application failed. Please try again later.');
    }

} catch (Exception $e) {
    echo json_encode([
        'success' => false,
        'message' => 'Error: ' . $e->getMessage()
    ]);
} finally {
    $conn->close();
}
?>