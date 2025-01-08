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
$tokenId = $data['tokenId'] ?? Null;
$classId = $data['classId'] ?? Null;

if (empty($tokenId) || empty($classId)) {
    echo json_encode([
        'success' => false,
        'message' => 'All fields are required',
    ]);
    header('Location: ../error/fields-required.php');
    exit(0);
}

// Validate admin token
$sql = "SELECT * FROM tbl_admin WHERE token_id = ?";
$stmt = $conn->prepare($sql);
$stmt->bind_param("s", $tokenId);
$stmt->execute();
$result = $stmt->get_result();

if ($result->num_rows !== 1) {
    echo json_encode([
        'success' => false,
        'message' => 'Invalid Token',
    ]);
    exit(0);
}

try {
    // Step 1: Fetch class data first to check program
    $sqlClassQuery = "
    SELECT * FROM tbl_class WHERE class_id = ?
    ";

    $stmt = $conn->prepare($sqlClassQuery);
    $stmt->bind_param("s", $classId);
    $stmt->execute();
    $classResult = $stmt->get_result();

    if ($classResult->num_rows > 0) {
        $classData = $classResult->fetch_assoc(); // Store all class data
        $classProgram = $classData['program'];  // Store the program of the class// Store all class data
        $classSubjectName = $classData['subject_name']; // Store all class data
        $classSubjectCode = $classData['subject_code']; // Store all class data
        $classUnits = $classData['units'];

        // Step 2: Fetch all petitions for the class
        $sqlQuery = "
        SELECT 
            s.first_name,
            s.last_name,
            s.student_id,
            s.tupv_id,
            s.program,
            s.email,
            p.*,  
            s.program as student_program,  
            c.subject_code,
            c.subject_name,
            c.units,
            c.program as class_program
        FROM tbl_petition p
        JOIN tbl_student s ON p.student_id = s.student_id
        JOIN tbl_class c ON p.class_id = c.class_id  
        WHERE c.program = ? 
        AND c.subject_code = ? 
        AND c.subject_name = ? 
        AND c.units = ? 
    ";

        $stmt = $conn->prepare($sqlQuery);
        $stmt->bind_param("ssss", $classProgram, $classSubjectCode, $classSubjectName, $classUnits);
        $stmt->execute();
        $result = $stmt->get_result();

        $data = [];
        if ($result->num_rows > 0) {
            // Step 3: Check if the student's program matches the class program
            while ($row = $result->fetch_assoc()) {
                if ($row['student_program'] === $classProgram) {
                    // Attach class data to each petition
                    $row['class_data'] = $classData; // Add full class data
                    $data[] = $row; // Add petition data if programs match
                }
            }

            if (count($data) > 0) {
                echo json_encode([
                    'success' => true,
                    'data' => $data,
                ]);
            } else {
                echo json_encode([
                    'success' => false,
                    'message' => 'No matching petitions found.',
                ]);
            }
        } else {
            echo json_encode([
                'success' => false,
                'message' => 'No petitions found.',
            ]);
        }
    } else {
        echo json_encode([
            'success' => false,
            'message' => 'Class data not found.',
        ]);
    }
} catch (Exception $e) {
    echo json_encode([
        'success' => false,
        'message' => $e->getMessage(),
    ]);
} finally {
    $conn->close();
}
?>