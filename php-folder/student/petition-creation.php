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
$studentId = $data['studentId'] ?? Null;
$subjectCode = $data['subjectCode'] ?? Null;
$subjectName = $data['subjectName'] ?? Null;
$subjectUnits = $data['subjectUnits'] ?? Null;
$program = $data['program'] ?? Null;
$classId = '';
$date = date('Y-m-d');
$time = date('h:i A');
$status = "pending";
$schedule = json_encode([
    [
    ]
]);
$petitionTracker = json_encode([
    [
        'receivedBy' => 'Program Head',
        'date' => $date,
        'time' => $time,
    ]
]);

if (!$studentId || !$subjectCode || !$subjectName || !$subjectUnits || !$program) {
    echo json_encode([
        'success' => false,
        'message' => 'All fields are required',
    ]);
    exit();
}
try {
    // Check if a petition already exists
    $checkStudentPetition = $conn->prepare("SELECT `class_id`, `subject_name`, `subject_code`, `units`, `capacity` 
    FROM `tbl_class` 
    WHERE `subject_name` = ? 
    AND `subject_code` = ? 
    AND `units` = ? 
    AND `program` = ? 
    AND `status` = ?
    AND `capacity` < 50 ");
    $checkStudentPetition->bind_param("sssss", $subjectName, $subjectCode, $subjectUnits, $program, $status);
    $checkStudentPetition->execute();
    $studentPetitionResult = $checkStudentPetition->get_result();

    if ($studentPetitionResult && $studentPetitionResult->num_rows > 0) {
        $row = $studentPetitionResult->fetch_assoc(); // Fetch the first matching row
        $classId = $row['class_id']; // Retrieve the `id` field from the row
        $checkStudentPetition = $conn->prepare("
        SELECT p.*, c.*
        FROM `tbl_petition` p
        JOIN `tbl_class` c ON p.class_id = c.class_id
        WHERE p.student_id = ? AND p.class_id = ? AND c.status = 'pending'
    ");
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

        $insertPetition = $conn->prepare("INSERT INTO `tbl_petition` ( `student_id`, `class_id`,`petition_tracker`, `status`, `date_created` ) VALUES ( ?,?, ?, ?, ?)");
        $insertPetition->bind_param("sssss", $studentId, $classId, $petitionTracker, $status, $date);
        if ($insertPetition->execute()) {
            echo json_encode([
                'success' => true,
                'message' => 'You have successfully joined an existing petition; therefore, a new one was not created.'
            ]);
            exit();
        } else {
            echo json_encode([
                'success' => false,
                'message' => 'Failed to submit petition.'
            ]);
            exit();
        }
    }
    $insertClass = $conn->prepare("INSERT INTO `tbl_class` ( `subject_code`, `subject_name`, `units`, `schedule`,`status`,`program`, `date_created` ) VALUES ( ?,?, ?, ?, ?,?,?)");
    $insertClass->bind_param("sssssss", $subjectCode, $subjectName, $subjectUnits, $schedule, $status, $program, $date);

    if ($insertClass->execute()) {
        $classId = strval($conn->insert_id);
        $insertPetition = $conn->prepare("INSERT INTO `tbl_petition` ( `student_id`, `class_id`,`petition_tracker`, `status`, `date_created` ) VALUES ( ?,?, ?, ?, ?)");
        $insertPetition->bind_param("sssss", $studentId, $classId, $petitionTracker, $status, $date);
        if ($insertPetition->execute()) {
            echo json_encode([
                'success' => true,
                'message' => 'Petition submitted successfully.'
            ]);
            exit();
        } else {
            echo json_encode([
                'success' => false,
                'message' => 'Failed to submit petition.'
            ]);
            exit();
        }
    } else {
        echo json_encode([
            'success' => false,
            'message' => 'Failed to submit petition.'
        ]);
        exit();
    }
} catch (Exception $e) {
    echo json_encode([
        'success' => false,
        'message' => 'Error: ' . $e->getMessage()
    ]);
    exit();
} finally {
    $conn->close();
}
?>