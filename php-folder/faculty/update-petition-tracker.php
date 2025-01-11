<?php

date_default_timezone_set('Asia/Manila');
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, GET, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') {
    exit(0);
}

include '../connection.php';

try {
    $date = date('Y-m-d');
    $time = date('h:i A');

    $data = json_decode(file_get_contents("php://input"), true);
    $tokenId = $data['tokenId'] ?? null;
    $facultyType = $data['facultyType'] ?? null;
    $classId = $data['classId'] ?? null;

    if (!$tokenId || !$facultyType || !$classId) {
        echo json_encode([
            'success' => false,
            'message' => 'All fields are required',
        ]);
        header('Location: ../error/fields-required.php');
    }

    $sql = "SELECT * FROM tbl_admin WHERE token_id = ?";
    $stmt = $conn->prepare($sql);
    $stmt->bind_param("s", $tokenId);
    $stmt->execute();
    $result = $stmt->get_result();

    if ($result->num_rows != 1) {
        throw new Exception('Invalid Token.');
    }

    function updateSchedule($conn, $newData, $classId)
    {
        $sql = "SELECT petition_tracker FROM tbl_petition WHERE class_id = ?";
        $stmt = $conn->prepare($sql);
        $stmt->bind_param("s", $classId);
        $stmt->execute();
        $result = $stmt->get_result();

        if ($result->num_rows === 0) {
            throw new Exception('Class ID not found.');
        }

        $row = $result->fetch_assoc();
        $currentData = json_decode($row['petition_tracker'], true); // Decode JSON into an array
        $stmt->close();

        // Ensure `currentData` is a valid array
        if (!is_array($currentData)) {
            $currentData = []; // Initialize as an empty array if invalid or null
        }

        // Add the new data to the current data without incrementing ID
        $currentData[] = $newData;

        // Encode the updated data back to JSON
        $updatedJson = json_encode($currentData);

        // Update the database with the modified JSON
        $sql = "UPDATE tbl_petition SET petition_tracker = ? WHERE class_id = ?";
        $stmt = $conn->prepare($sql);
        $stmt->bind_param("si", $updatedJson, $classId);
        $success = $stmt->execute();
        $stmt->close();

        if (!$success) {
            throw new Exception('Failed to update the petition tracker.');
        }

        return true;
    }

    $newData = array(
        'receivedBy' => $facultyType,
        'date' => $date,
        'time' => $time,
    );

    $result = updateSchedule($conn, $newData, $classId);

    echo json_encode([
        'success' => true,
        'message' => 'Petition Tracker submitted successfully.',
    ]);
} catch (Exception $e) {
    echo json_encode([
        'success' => false,
        'message' => $e->getMessage(),
    ]);
} finally {
    $conn->close();
}

?>