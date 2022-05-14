import Route from '@ioc:Adonis/Core/Route'

Route.get('/test', async () => {
  return 'test'
})

Route.group(() => {
  // Authentication
  Route.group(() => {
    Route.post('/login', 'AdminsController.login')
  }).prefix('/auth')

  // Education Info Lookup
  Route.group(() => {
    Route.get('/', 'EducationInfoController.educationInfoDropdown')
  }).prefix('/education/info')

  // Protected Routes
  Route.group(() => {
    // Admin
    Route.group(() => {
      Route.post('/', 'AdminsController.admin')
      Route.post('/all', 'AdminsController.all')
      Route.post('/create', 'AdminsController.create')
      Route.put('/update', 'AdminsController.update')
      Route.delete('/delete', 'AdminsController.delete')
    })

    // Category
    Route.group(() => {
      Route.post('/', 'CategoriesController.category')
      Route.post('/all', 'CategoriesController.categories')
      Route.post('/create', 'CategoriesController.createCategory')
      Route.put('/update', 'CategoriesController.updateCategory')
      Route.delete('/delete', 'CategoriesController.deleteCategory')
    }).prefix('/category')

    // Instructors
    Route.group(() => {
      Route.post('/', 'InstructorsController.getInstructor')
      Route.post('/all', 'InstructorsController.getInstructors')
      Route.post('/create', 'InstructorsController.createInstructor')
      Route.put('/update', 'InstructorsController.updateInstructor')
      Route.post('/activate', 'InstructorsController.activateInstructor')
      Route.post('/deactivate', 'InstructorsController.deactivateInstructor')
      // Instructor Codes
      Route.group(() => {
        Route.post('/import', 'InstructorCodesController.import')
      }).prefix('codes')
    }).prefix('/instructor')

    // Students
    Route.group(() => {
      Route.post('/', 'StudentsController.getStudent')
      Route.post('/all', 'StudentsController.all')
      Route.post('/ban/toggle', 'EnrollmentController.toggleBanStudent')
      Route.put('/update', 'StudentsController.updateStudent')
      // Wallet
      Route.group(() => {
        Route.post('/add', 'StudentWalletsController.addToWallet')
        Route.post('/deduct', 'StudentWalletsController.deductFromWallet')
        Route.post('/set', 'StudentWalletsController.setWalletAmount')
      }).prefix('/wallet')
    }).prefix('/user')

    // Classrooms
    Route.group(() => {
      Route.post('/all', 'ClassroomsController.classrooms')
      Route.post('/', 'ClassroomsController.classroom')
      Route.post('/create', 'ClassroomsController.createClassroom')
      Route.put('/', 'ClassroomsController.updateClassroom')
      Route.delete('/delete', 'ClassroomsController.deleteClassroom')
      Route.post('/enrolled', 'ClassroomsController.enrolled')
      Route.post('/enrollments', 'EnrollmentController.getAllUserEnrollments')

      // ClassroomTabs
      Route.group(() => {
        Route.post('/fetch', 'ClassroomTabsController.fetch')
        Route.post('/get', 'ClassroomTabsController.get')
        Route.post('/create', 'ClassroomTabsController.create')
        Route.patch('/update', 'ClassroomTabsController.update')
        Route.patch('/update-many', 'ClassroomTabsController.updateMany')
        Route.delete('/delete', 'ClassroomTabsController.delete')
        Route.post('/curriculum/update', 'ClassroomsController.updateCurriculum')
      }).prefix('/tabs')
    }).prefix('/classroom')

    // Sections
    Route.group(() => {
      Route.post('/fetch', 'SectionsController.fetch')
      Route.post('/get', 'SectionsController.get')
      Route.post('/create', 'SectionsController.create')
      Route.patch('/update', 'SectionsController.update')
      Route.patch('/update-many', 'SectionsController.updateMany')
      Route.delete('/delete', 'SectionsController.delete')
    }).prefix('/section')

    // Courses
    Route.group(() => {
      Route.post('/all', 'CoursesController.courses')
      Route.post('/create', 'CoursesController.createCourse')
      Route.post('/', 'CoursesController.course')
      Route.put('/update', 'CoursesController.updateCourse')
      Route.delete('/delete', 'CoursesController.deleteCourse')
      Route.post('/students', 'CoursesController.getAllStudentsInACourse')
      Route.post('/enrolled', 'CoursesController.enrolled')
      Route.post('/unenrolled', 'CoursesController.getUnEnrolledUsers')
      Route.post('/enroll', 'StudentsController.enrollInCourse')
      Route.post('/unenroll', 'StudentsController.unEnrollFromCourse')
      Route.post('/prerequisite/update', 'CoursesController.updatePrerequisiteCourses')
    }).prefix('/course')

    // Units
    Route.group(() => {
      Route.post('/update', 'UnitsController.updateUnits')
      Route.post('/update/:id', 'UnitsController.updateUnit')
      Route.delete('/delete', 'UnitsController.deleteUnit')
    }).prefix('/units')

    // Invoices
    Route.group(() => {
      Route.post('/all', 'InvoicesController.invoices')
      Route.post('/', 'InvoicesController.invoice')
      Route.put('/', 'InvoicesController.updateInvoiceStatus')
      Route.post('/process', 'InvoicesController.processInvoice')
    }).prefix('/invoice')

    // Dropdown menus
    Route.group(() => {
      Route.get('/instructors', 'DropdownsController.dropdownInstructors')
      Route.get('/categories', 'DropdownsController.dropdownCategories')
      Route.get('/classrooms', 'DropdownsController.dropdownClassrooms')
      Route.get('/courses/:classroom_id', 'DropdownsController.dropdownCourses')
      Route.get('/units/:course_id', 'DropdownsController.dropdownUnits')
      Route.get('/sections/:classroom_id', 'DropdownsController.dropdownSections')
      Route.get('/batches', 'DropdownsController.dropdownBatches')
      Route.get('/recharge-cards-batches', 'DropdownsController.dropdownRechargeCardsBatches')
      Route.get('/addresses', 'DropdownsController.dropdownAddresses')
      Route.post('/prerequisites', 'DropdownsController.dropdownPrerequisites')
    }).prefix('/dropdown')

    // Newsfeed
    Route.group(() => {
      Route.post('/all', 'NewsfeedsController.newsfeeds')
      Route.post('/', 'NewsfeedsController.newsfeed')
      Route.post('/create', 'NewsfeedsController.createNewsfeed')
      Route.put('/update', 'NewsfeedsController.updateNewsfeed')
      Route.delete('/delete', 'NewsfeedsController.deleteNewsfeed')
    }).prefix('/newsfeed')

    // Scratchcards
    Route.group(() => {
      Route.post('/all', 'ScratchcardsController.scratchcards')
      Route.post('/generate', 'ScratchcardsController.generateScratchCard')
      Route.delete('/delete', 'ScratchcardsController.deleteScratchcard')
      Route.delete('/delete/by-batch', 'ScratchcardsController.deleteByBatch')
    }).prefix('/scratchcards')

    // RechargeCards
    Route.group(() => {
      Route.post('/all', 'RechargeCardsController.rechargeCards')
      Route.post('/generate', 'RechargeCardsController.generateRechargeCard')
      Route.delete('/delete', 'RechargeCardsController.deleteRechargeCards')
      Route.delete('/delete/by-batch', 'RechargeCardsController.deleteByBatch')
    }).prefix('/recharge-cards')

    // Imports
    Route.group(() => {
      Route.post('/banned', 'ImportsController.banningStudents')
      Route.post('/course-enroll', 'ImportsController.enrollStudentsInCourses')
      Route.post('/classroom-enroll', 'ImportsController.enrollStudentsInClassroom')
      Route.post('/', 'ImportsController.imports')
    }).prefix('/import')

    // Enrollment Analytics
    Route.group(() => {
      Route.group(() => {
        Route.post('count', 'EnrollmentController.classroomEnrollmentCount')
        Route.post('analytic', 'EnrollmentController.classroomEnrollmentAnalytic')
        Route.post('analytic/graph', 'EnrollmentController.classroomEnrollmentGraph')
      }).prefix('classroom')
      Route.group(() => {
        Route.post('analytic', 'EnrollmentController.classroomsEnrollmentAnalytic')
        Route.get('count', 'EnrollmentController.classroomsEnrollmentCount')
        Route.post('analytic/graph', 'EnrollmentController.classroomsEnrollmentGraph')
      }).prefix('classrooms')
      Route.group(() => {
        Route.post('count', 'EnrollmentController.courseEnrollmentCount')
        Route.post('analytic/graph', 'EnrollmentController.courseEnrollmentGraph')
      }).prefix('course')
    }).prefix('/enrollment')

    // Admission forms
    Route.group(() => {
      Route.post('/classroom/get', 'AdmissionFormController.getByClassroomId')
      Route.post('/get', 'AdmissionFormController.get')
      Route.post('/create/full', 'AdmissionFormController.createAdmissionForm')
      Route.post('/update', 'AdmissionFormController.updateAdmissionForm')
      // Form Questions
      Route.group(() => {
        Route.post('/update', 'AdmissionFormController.updateQuestions')
        Route.post('/add', 'AdmissionFormController.addQuestion')
        Route.delete('/remove', 'AdmissionFormController.removeQuestionFromAdmission')
      }).prefix('/question')
    }).prefix('/admission/form')

    // IPs
    Route.group(() => {
      Route.post('/fetch', 'IpController.fetch')
    }).prefix('/user/ip')

    // Admission
    Route.group(() => {
      Route.get('/:classroom_id', 'AdmissionController.responses')
      Route.post('/actions', 'AdmissionController.responsesAction')
    }).prefix('/admissions')

    // Documents
    Route.group(() => {
      Route.post('/create', 'DocumentsController.create')
      Route.post('/update', 'DocumentsController.update')
      Route.post('/fetch', 'DocumentsController.fetch')
    }).prefix('/document')

    // Documents
    Route.group(() => {
      Route.post('/create', 'VideosController.create')
      Route.post('/get', 'VideosController.get')
      Route.post('/update', 'VideosController.update')
      Route.delete('/delete', 'VideosController.delete')
    }).prefix('/video')
    // Test
    Route.group(() => {
      Route.post('/create', 'TestController/TestsController.create')
      Route.post('/update', 'TestController/TestsController.update')
      Route.post('/get', 'TestController/TestsController.get')
      Route.post('/activate', 'TestController/TestsController.activate')
      Route.post('/deactivate', 'TestController/TestsController.deactivate')
      Route.delete('/delete', 'TestController/TestsController.delete')
    }).prefix('test')
    // Web Content
    Route.group(() => {
      Route.post('/create', 'WebContentController.create')
      Route.post('/update', 'WebContentController.update')
      Route.post('/get', 'WebContentController.get')
      Route.delete('/delete', 'WebContentController.delete')
    }).prefix('/webContent')

    // Uploads
    Route.group(() => {
      Route.post('/photo', 'UploadsController.uploadPhoto')
      Route.post('/document', 'UploadsController.uploadDocument')
    }).prefix('/upload')

    // Role
    Route.group(() => {
      Route.post('/create', 'RolePermissionsController.create')
      Route.put('/update', 'RolePermissionsController.update')
      Route.post('/get', 'RolePermissionsController.get')
      Route.post('/fetch', 'RolePermissionsController.fetch')
      Route.delete('/delete', 'RolePermissionsController.delete')
      Route.post('/assign', 'RolePermissionsController.assign')
    }).prefix('/role')

    // Role
    Route.group(() => {
      Route.get('/all', 'RolePermissionsController.allPermissions')
    }).prefix('/permission')

    // Test
    Route.group(() => {
      //Tags
      Route.group(() => {
        Route.post('/create', 'TestController/TagsController.create')
        Route.post('/get', 'TestController/TagsController.getOne')
        Route.post('fetch', 'TestController/TagsController.fetch')
        Route.put('/update', 'TestController/TagsController.update')
        Route.delete('/delete', 'TestController/TagsController.delete')
      }).prefix('/tag')

      // Questions
      Route.group(() => {
        Route.post('/fetch', 'TestController/TestQuestionsController.fetch')
        Route.post('/get', 'TestController/TestQuestionsController.get')
        Route.delete('/delete', 'TestController/TestQuestionsController.delete')
        Route.post('/create', 'TestController/TestQuestionsController.create')
        Route.post('/update', 'TestController/TestQuestionsController.update')
      }).prefix('/questions')

      // Models
      Route.group(() => {
        Route.post('/get', 'TestController/TestModelsController.getTestModel')
        Route.post('/create', 'TestController/TestModelsController.createTestModel')
        Route.put('/update', 'TestController/TestModelsController.updateTestModel')
        Route.delete('/delete', 'TestController/TestModelsController.deleteTestModel')
      }).prefix('/models')
    }).prefix('/test')

    // Webinar
    Route.group(() => {
      Route.post('/get', 'WebinarController.get')
      Route.post('/fetch', 'WebinarController.fetch')
      Route.post('/create', 'WebinarController.create')
      Route.put('/update', 'WebinarController.update')
      Route.delete('/delete', 'WebinarController.delete')
      Route.group(() => {
        Route.post('/add', 'WebinarController.addSlots')
        Route.put('/update', 'WebinarController.updateSlot')
        Route.delete('/delete', 'WebinarController.deleteSlot')
      }).prefix('slot')
    }).prefix('webinar')
  }).middleware('auth')
}).prefix('/api/admin')
Route.group(() => {
  Route.get('/:classroom_id', 'AdmissionController.responses')
  Route.post('/actions', 'AdmissionController.responsesAction')
})
  .prefix('/api/admin/admissions')
  .middleware('auth')

Route.group(() => {
  Route.get('/search/:query', 'BulkMessagesController.search')
  Route.post('/send', 'BulkMessagesController.send')
  Route.post('/import', 'BulkMessagesController.import')
  Route.post('/fetch', 'BulkMessagesController.fetchHistory')
})
  .prefix('/api/admin/bulk/messages')
  .middleware('auth')
