<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, GET, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') {
    exit(0); // Handle preflight request
}
require_once 'libs/fpdf.php';
include '../connection.php';

// Get POST data
$data = json_decode(file_get_contents("php://input"), true);
$tokenId = $data['tokenId'] ?? 'asdsad';
$petitionId = $data['petitionId'] ?? '2';
$capacity = $data['capacity'] ?? '2';
$studentId = $data['studentId'] ?? '2';

if (!$tokenId) {
    echo json_encode([
        'success' => false,
        'message' => 'All fields are required',
    ]);
    return;
}

// Fetch the transaction data based on form_id
$query = "
    SELECT 
        s.first_name, 
        s.last_name, 
        s.tupv_id, 
        s.email, 
        p.class_id,
        p.student_id,
        c.subject_code, 
        c.subject_name, 
        c.program, 
        c.units
    FROM 
        tbl_petition p
    JOIN 
        tbl_class c ON p.class_id = c.class_id
    JOIN 
        tbl_student s ON p.student_id = s.student_id 
    WHERE 
        p.petition_id =?";

$stmt = $conn->prepare($query);
$stmt->bind_param("s", $petitionId);
$stmt->execute();
$result = $stmt->get_result();

$row = $result->fetch_assoc();

$fullName = $row['first_name'] . ' ' . $row['last_name'];
$tupvId = $row['tupv_id'];
$program = $row['program'];
$classId = $row['class_id'];
$email = $row['email'];
$subjectCode = $row['subject_code'];
$subjectName = $row['subject_name'];
$subjectUnits = $row['units'];
$dateNow = date("F j, Y");
$title = 'Petition for Summer Class';
$note = 'Noted: ';
$verified = "Verified:";
$approved = "Approved:";



$query = "
    SELECT 
        first_name, 
        last_name, 
        faculty_type, 
        program
    FROM 
        tbl_admin WHERE program=? AND faculty_type = 'Program Head'
    ";

$stmtClass = $conn->prepare($query);
$stmtClass->bind_param("s", $program);
$stmtClass->execute();
$resultClass = $stmtClass->get_result();

$program = $resultClass->fetch_assoc();
$programHead = ucwords(strtolower($program['first_name'])) . ' ' . ucwords(strtolower($program['last_name']));


$query = "
    SELECT 
        a.first_name, 
        a.last_name, 
        c.class_id, 
        c.program
    FROM 
        tbl_class c
    JOIN 
        tbl_admin a ON a.faculty_id = c.faculty_id
    WHERE 
        c.class_id = ?
";

$stmtClass = $conn->prepare($query);
$stmtClass->bind_param("s", $classId);
$stmtClass->execute();
$resultClass = $stmtClass->get_result();

$program = $resultClass->fetch_assoc();
$facultyName = ucwords(strtolower($program['first_name'])) . ' ' . ucwords(strtolower($program['last_name']));



$queryDean = "
    SELECT 
        first_name, 
        last_name, 
        faculty_type
    FROM 
        tbl_admin 
    WHERE 
        faculty_type IN ('College Dean', 'ADAA', 'Registrar')
";

$stmtDean = $conn->prepare($queryDean);
$stmtDean->execute();
$resultDean = $stmtDean->get_result();

$deans = [];
while ($dean = $resultDean->fetch_assoc()) {
    $firstName = ucwords(strtolower($dean['first_name']));
    $lastName = ucwords(strtolower($dean['last_name']));
    $deans[$dean['faculty_type']] = $firstName . ' ' . $lastName;
}
$collegeDean = $deans['College Dean'] ?? "No College Dean found";
$adaa = $deans['ADAA'] ?? "No ADAA found";
$registrar = $deans['Registrar'] ?? "No ADAA found";



// Get page size from query string or use default (A4)
$page_size = isset($_GET['page_size']) ? strtoupper($_GET['page_size']) : 'A4';

// Ensure page size is valid, else default to A4
$valid_page_sizes = ['A3', 'A4', 'A5', 'LETTER', 'LEGAL'];
if (!in_array($page_size, $valid_page_sizes)) {
    $page_size = 'A4';
}
class PDF extends FPDF
{
    // Page Header
    function Header()
    {
        $this->Image('assets/header.png', 10, 5, 190);
    }

    // Page Footer
    function Footer()
    {
        $this->SetY(-20);
        $this->SetFont('Arial', 'I', 8);
        $this->Cell(0, 10, 'Our Quality Management System is Certified according to ISO9001', 0, 0, 'C');
    }
}

$pdf = new PDF('P', 'mm', 'A4');
$pdf->AddPage();

// Title
$pdf->SetFont('Arial', '', 14);
$pdf->setY(40);
$pdf->Cell(0, 5, 'COLLEGE OF ENGINEERING', 0, 1, 'C');
$pdf->SetFont('Arial', 'B', 20);
$pdf->setY(55);
$pdf->Cell(0, 5, 'PETITION TO OFFER TUTORIAL CLASS', 0, 1, 'C');

$pdf->SetFont('Arial', 'B', 14);
$pdf->setY(65);
$pdf->setX(35);
$pdf->Cell(0, 5, "COMES NOW,", 0, 0, ''); // Bold text

$pdf->SetFont('Arial', '', 14);
$pdf->setY(65);
$pdf->setX(70);
$pdf->Cell(0, 5, "the herein student-petitioners respectfully avers:", 0, 0, ''); // Regular text
$pdf->Ln(5);

// Petition Content number 1

$pdf->SetFont('Arial', 'B', 14);
$pdf->setY(80);
$pdf->setX(15);
$pdf->Cell(0, 5, "1.", 0, 0, '');

$pdf->SetFont('Arial', '', 14);
$pdf->setY(80);
$pdf->setX(25);
$pdf->MultiCell(0, 5, "That we are a group of bonafide students of the Technological University of the Philippines Visayas, City of Talisay, Negros Occ. currently enrolled would like to respectfully request for the offering of a tutorial class during the ___________ term of school year _____________ ;", );
$pdf->Ln(5);


// Petition Content number 2

$pdf->SetFont('Arial', 'B', 14);
$pdf->setX(15);
$pdf->Cell(0, 5, "2.", 0, 0, '');

$pdf->SetFont('Arial', '', 14);
$pdf->setX(25);
$pdf->MultiCell(0, 5, "That the subject(s) we would like to be offered during the term is/are as follows:
", );

$pdf->setX(20);
$pdf->SetFont('Arial', 'B', 12);
$pdf->Cell(50, 10, 'Subject Code', 0, 0, 'C');
$pdf->Cell(90, 10, 'Descriptive Title', 0, 0, 'C');
$pdf->Cell(30, 10, 'Units', 0, 0, 'C');
$pdf->Ln();

$pdf->setX(20);
$pdf->SetFont('Arial', '', 12);
$pdf->Cell(50, 10, $subjectCode, 0, 0, 'C');
$pdf->Cell(90, 10, $subjectName, 0, 0, 'C');
$pdf->Cell(30, 10, $subjectUnits, 0, 0, 'C');
$pdf->Ln(15);

$pdf->Ln(5);



// Petition Content number 3
$pdf->SetFont('Arial', 'B', 14);
$pdf->setX(15);
$pdf->Cell(0, 5, "3.", 0, 0, '');

$pdf->SetFont('Arial', '', 14);
$pdf->setX(25);
$pdf->MultiCell(0, 5, "That upon passing the subject(s) approved to be offered we may be able to cope with our academic deficiency(ies) and be able to take regular loads in the succeeding term;", );
$pdf->Ln(5);


// Petition Content number 4
$pdf->SetFont('Arial', 'B', 14);
$pdf->setX(15);
$pdf->Cell(0, 5, "4.", 0, 0, '');

$pdf->SetFont('Arial', '', 14);
$pdf->setX(25);
$pdf->MultiCell(0, 5, "That we are aware of the provision of Item 1.0 of TUP Order No. 18, s. 2019 which states 'Nature of Tutorial Classes. These are small classes which may be opened under the following conditions;
    
    1.1	Upon the petition of a student of the following justifications:
    'The student concerned has failed the course being petitioned or was not able to take it during the regular semester or term due to under loading or for having taken a Leave of Absence.

    1.2 'Should a course be no longer available in case of old returning students, substitution of courses shall be applied instead of a tutorial class, in accordance with relevant University rules and regulations.", );

$pdf->Ln(5);

// Petition Content number 5
$pdf->SetFont('Arial', 'B', 14);
$pdf->setX(15);
$pdf->Cell(0, 5, "5.", 0, 0, '');

$pdf->SetFont('Arial', '', 14);
$pdf->setX(25);
$pdf->MultiCell(0, 5, "That we are aware of Item 2.0 of the preceding Order which states Fees and Faculty Pay for the Tutorial Classes. Until otherwise provided, the student in the tutorial class shall voluntarily pay for a fixed fee of Php7,000.00 to be subdivided among themselves, to be paid for the service of the faculty handling tutorial class regardless of the faculty’s academic rank. Such voluntary payment shall be indicated by the students in their petition letter.
\n\n\n\n\n\n\n
", );
$pdf->Ln(5);



// Petition Content number 6
$pdf->SetFont('Arial', 'B', 14);
$pdf->setX(15);
$pdf->Cell(0, 5, "6.", 0, 0, '');

$pdf->SetFont('Arial', '', 14);
$pdf->setX(25);
$pdf->MultiCell(0, 5, "That we are also aware of Item 3.0 of the same Order which states 'Number of students. Tutorial should not have more than 9 students. (No student shall be allowed to take more than one course regardless of the number of units on tutorial in a semester) '", );

$pdf->Ln(5);

// Petition Content number 7
$pdf->SetFont('Arial', 'B', 14);
$pdf->setX(15);
$pdf->Cell(0, 5, "7.", 0, 0, '');

$pdf->SetFont('Arial', '', 14);
$pdf->setX(25);
$pdf->MultiCell(0, 5, "That we are also aware of Item 4.0 of the same Order which states 'Conduct of Tutorial Classes. A pre-class conference between the student(s), the faculty, and the Department Head shall be held to map out the requirements of the class. The schedule of meetings, the reports to be submitted by the faculty of the Department Head, and such other analogous terms and conditions. Care must be exercised in adopting blended learning approach. The course outline and syllabus must be properly discussed in the pre-class conference. Tutorial subjects shall not be included in the FTE or PT of an employee but shall be indicated in the teaching load. The maximum number of tutorial course a faculty is allowed to handle shall be one (1).", );

$pdf->Ln(5);

// Petition Content number 8
$pdf->SetFont('Arial', 'B', 14);
$pdf->setX(15);
$pdf->Cell(0, 5, "8.", 0, 0, '');

$pdf->SetFont('Arial', '', 14);
$pdf->setX(25);
$pdf->MultiCell(0, 5, "That we are also aware of Item 6.0 of the same Order which states 'A tutorial course shall be included in the total number of units a student may enroll in a semester or term.

", );

$pdf->Ln(5);


// Petition Content number Wherefore
$pdf->SetFont('Arial', 'B', 14);
$pdf->setX(15);
$pdf->Cell(0, 5, "WHEREFORE, ", 0, 0, '');

$pdf->SetFont('Arial', '', 14);
$pdf->setX(50);
$pdf->MultiCell(0, 5, "it is respectfully prayed that we be allowed to take the special class 
           upon approval of this petition.", );

$pdf->Ln(5);



// Petition Content number Wherefore
$pdf->SetFont('Arial', 'B', 14);
$pdf->setX(15);
$pdf->Cell(0, 5, "SIGNED, ", 0, 0, '');

$pdf->SetFont('Arial', '', 14);
$pdf->setX(37);
$pdf->MultiCell(0, 5, "this ________ day of _______________ at the City of Talisay, Negros Occidental, Philippines.

", );

$pdf->Ln(5);

$pdf->SetFont('Arial', 'B', 14);
$pdf->Cell(0, 5, "LIST OF STUDENTS - PETITIONERS IN SPECIAL CLASS", 0, 0, 'C');

$pdf->Ln(10);
$pdf->SetFont('Arial', 'B', 11);

// Table Header
$pdf->Cell(15, 20, 'No.', 1, 0, 'C');
$pdf->Cell(40, 20, 'Name', 1, 0, 'C');
$pdf->Cell(30, 20, 'Year & Section', 1, 0, 'C');
$pdf->SetFont('Arial', 'B', 8);
$x = $pdf->GetX();  // Store the current X position
$y = $pdf->GetY();  // Store the current Y position

$pdf->SetXY($x, $y);
$pdf->MultiCell(30, 6.66, "Previous Faculty who handled the subject?", 1, 'C');
$pdf->SetXY($x + 30, $y);

$pdf->SetFont('Arial', 'B', 6);
$pdf->MultiCell(15, 1.81, "\nTotal Number Of Units Enrolled Including This Course And Other Special Class\n\n", 1, 'C');
$pdf->SetXY($x + 45, $y);
$pdf->SetFont('Arial', 'B', 8);
// Overload Section with two sub-columns
$pdf->Cell(30, 10, "OVERLOAD?", 1, 0, 'C');
$pdf->SetXY($pdf->GetX() - 30, $pdf->GetY() + 10); // Move position for sub-columns
$pdf->SetFont('Arial', 'B', 4);
$pdf->Cell(15, 10, 'NO', 1, 0, 'C');
$pdf->Cell(15, 10, "YES (No. of Units)", 1, 0, 'C');

$pdf->SetFont('Arial', '', 12);

$pdf->SetXY($pdf->GetX(), $pdf->GetY() - 10);
$pdf->Cell(30, 20, 'SIGNATURE', 1, 1, 'C');
// Student Rows
$pdf->SetFont('Arial', '', 10);

$query = "
    SELECT 
        s.first_name, 
        s.last_name,
        p.student_id 
    FROM 
        tbl_petition p
    INNER JOIN 
        tbl_student s ON p.student_id = s.student_id
    WHERE 
        p.status = 'approved' 
        AND p.class_id = ?
";

$stmtData = $conn->prepare($query);
$stmtData->bind_param("s", $classId);
$stmtData->execute();
$resultData = $stmtData->get_result();

$students = [];
while ($row = $resultData->fetch_assoc()) {
    $firstName = ucwords(strtolower($row['first_name']));
    $lastName = ucwords(strtolower($row['last_name']));
    $students[] = $firstName . ' ' . $lastName;
}

// Generate PDF with student names
for ($i = 0; $i < 9; $i++) {
    if ($i == 6) {
        $pdf->MultiCell(0, 5, "\n\n\n\n\n\n\n");
    }
    $pdf->Cell(15, 10, ($i + 1) . '.', 1, 0, 'C');

    // Check if student exists in the list, otherwise leave blank
    $name = isset($students[$i]) ? $students[$i] : '';
    $pdf->Cell(40, 10, $name, 1, 0);  // First name + Last name

    $pdf->Cell(30, 10, '', 1, 0);
    $pdf->Cell(30, 10, '', 1, 0);
    $pdf->Cell(15, 10, '', 1, 0);
    $pdf->Cell(15, 10, '', 1, 0);
    $pdf->Cell(15, 10, '', 1, 0);
    $pdf->Cell(30, 10, '', 1, 1);
}

$pdf->Ln(5);

// RECOMMENDING APPROVAL
$pdf->SetFont('Arial', 'B', 16);
$pdf->setX(15);
$pdf->MultiCell(0, 5, "\n\n\nRECOMMENDING APPROVAL:", );

$pdf->Ln(5);

$pdf->SetFont('Arial', 'B', 14);
$pdf->setX(15);
$pdf->MultiCell(0, 5, "
  Program Head: 				$programHead
  College Dean:				   $collegeDean
", );

$pdf->Ln(5);


// RECOMMENDING APPROVAL
$pdf->SetFont('Arial', 'B', 16);
$pdf->setX(15);
$pdf->MultiCell(0, 5, "\n\n\nAPPROVED:", );

$pdf->Ln(5);

$pdf->SetFont('Arial', 'B', 14);
$pdf->setX(15);
$pdf->MultiCell(0, 5, "
  Asst. Director for Academic Affairs:   $adaa\n\n\n", );

$pdf->Ln(5);


$pdf->SetFont('Arial', 'B', 14);
$pdf->setX(15);
$pdf->MultiCell(0, 5, "SUBSCRIBED and sworn to before me, in the City of Talisay, Negros Occidental, this _______ day of _________________ by the herein student-petitioners who voluntarily executed this petition.
\n\n\n", );

$pdf->Ln(5);



$pdf->SetFont('Arial', 'B', 14);
$pdf->Cell(0, 10, 'NOTARY PUBLIC', 0, 1, 'R');
$pdf->setX(15);
$pdf->MultiCell(0, 5, "
DOC. NO.    _____________;
PAGE NO.   _____________;
BOOK NO.  _____________;
SERIES OF _____________.", );

$pdf->Ln(60);

// form 5 

$pdf->SetFont('Arial', 'B', 20);
$pdf->MultiCell(0, 5, "\n\n\n\n\n\n REQUEST FOR TUTORIAL CLASS", 0, 'C');
$pdf->Ln(5);

$dateNow = date("F d Y");

$x = $pdf->GetX();
$y = $pdf->GetY();

$pdf->SetFont('Arial', '', 6);
$pdf->SetXY($x + 145, $y + 90);
$pdf->MultiCell(40, 2.4, "
NOTE: Copy Furnish the following offices of the Approved Request for Tutorial/Special Class:

1.	ADAA (Original Copy)
2.	Registrar
3.	Accounting
4.	Office of the College Dean
5.	Program Head
6.	Faculty/Instructor
7.	Student’s Copy

", 1, '');



$pdf->SetFont('Arial', '', 14);
$pdf->SetXY(15, $y);
$pdf->MultiCell(0, 10, "
DATE:         $dateNow;

TO:           $adaa (Assistant Director for Academic Affairs)

THRU:         $collegeDean (College Dean)
              $programHead (Program Head)
              $registrar (Registrar)

FROM:         CONCERNED STUDENTS

RE:           REQUEST FOR SPECIAL CLASS
_________________________________________________________________
");

$pdf->SetX(15);
$pdf->SetFont('Arial', '', 14);
$pdf->MultiCell(0, 7, "
We would like to request approval for a $subjectCode class in $subjectName for _________ term of this school year __________due to the 
following reasons:

1. ______________________________________________________________
2. ______________________________________________________________
_________________________________________________________________
_________________________________________________________________

                Please see the list of students stated in the Petition form.
");

$pdf->Ln(5);

$pdf->Ln(60);

// form 7

$pdf->SetFont('Arial', 'B', 20);
$pdf->MultiCell(0, 5, "\n\n\n\n\n\n REQUEST FOR TUTORIAL CLASS", 0, 'C');
$pdf->Ln(5);

$dateNow = date("F d Y");

$x = $pdf->GetX();
$y = $pdf->GetY();

$pdf->SetFont('Arial', '', 6);
$pdf->SetXY($x + 145, $y + 75);
$pdf->MultiCell(40, 2.4, "
NOTE: Copy Furnish the following offices of the Approved Request for Tutorial/Special Class:

1.	ADAA (Original Copy)    
2.	Registrar
3.	Accounting
4.	Office of the College Dean
5.	Program Head
6.	Faculty/Instructor
7.	Student’s Copy

", 1, '');



$pdf->SetFont('Arial', '', 14);
$pdf->SetXY(15, $y);
$pdf->MultiCell(0, 10, "
DATE:         $dateNow;

TO:           $adaa (Assistant Director for Academic Affairs)

THRU:         $collegeDean (College Dean)
              $programHead (Program Head)

FROM:         $facultyName (Faculty)

RE:           REQUEST FOR APPROVAL OF TUTORIAL CLASS
_________________________________________________________________
");

$pdf->SetX(15);
$pdf->SetFont('Arial', '', 14);
$pdf->MultiCell(0, 7, "..............................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................
	Attached are the students' letter request, proposed class schedule, and computation of actual hours required for completion.

");

$pdf->Ln(5);


$pdf->Output();

?>