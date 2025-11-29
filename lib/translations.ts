export type Language = 'en' | 'az'

export const translations = {
  en: {
    // File Upload
    'upload.title': 'STEP 1: LOAD QUESTIONS',
    'upload.subtitle': 'Upload a JSON file or paste your questions directly',
    'upload.uploadBtn': 'Upload file',
    'upload.loading': 'Loading...',
    'upload.dragDrop': 'Drag & Drop a file here',
    'upload.pasteBtn': 'Or paste JSON directly',
    'upload.loadBtn': 'Load JSON',
    'upload.cancelBtn': 'Cancel',
    'upload.errorMsg': 'Question {index} has invalid format. Required: question, answers (array), correct_answer',
    'upload.parseError': 'Failed to parse JSON file. Please check the format.',
    'upload.parseErrorPaste': 'Failed to parse JSON. Please check the format.',
    'upload.fileError': 'Please upload a .json file',
    'upload.format': 'Expected JSON format:',
    'upload.formatDesc': 'Array or object with question, answers (array), and correct_answer fields.',

    // Library
    'library.title': 'Your Library',
    'library.empty': 'No saved quizzes yet',
    'library.saveBtn': 'Save to Library',
    'library.loadBtn': 'Load',
    'library.deleteBtn': 'Delete',
    'library.namePlaceholder': 'Enter quiz name...',
    'library.saveSuccess': 'Quiz saved!',
    'library.confirmDelete': 'Are you sure?',
    'library.saved': 'Saved Quizzes',
    'library.startBtn': 'Start Quiz',
    'library.cancelBtn': 'Cancel',

    // Quiz Setup
    'setup.title': 'STEP 2: CONFIGURE QUIZ',
    'setup.subtitle': 'Select how many questions you want to answer',
    'setup.numQuestions': 'NUMBER OF QUESTIONS',
    'setup.available': 'Available: {count} questions',
    'setup.allQuestions': 'Use all questions (Sequential)',
    'setup.shuffle': 'Shuffle answer options',
    'setup.shuffleQuestions': 'Shuffle questions',
    'setup.startBtn': 'Start Quiz',
    'setup.progress': 'Completed: {answered} / {total}',
    'setup.resetProgress': 'Reset Progress',
    'setup.mode.study': 'Study Mode',
    'setup.mode.studyDesc': 'Review all questions with correct answers highlighted',

    // Quiz Display
    'quiz.nextQuestion': 'Next Question',
    'quiz.finish': 'Finish',
    'quiz.questionOf': 'Question',
    'quiz.of': 'of',
    'quiz.score': 'Score',

    // Results
    'results.title': 'Quiz Complete!',
    'results.scored': 'You scored {score} out of {total}',
    'results.resetBtn': 'Start New Quiz',
    'results.incorrectTitle': 'Incorrect Answers',
    'results.yourAnswer': 'Your Answer:',
    'results.correctAnswer': 'Correct Answer:',
    'results.perfectScore': 'Perfect Score! No incorrect answers.',

    // Theme/Language
    'theme.darkMode': 'Dark mode',
    'theme.lightMode': 'Light mode',
    'lang.azerbaijani': 'AZ',
    'lang.english': 'EN',
  },
  az: {
    // File Upload
    'upload.title': 'Sualları yükləyin',
    'upload.subtitle': 'JSON faylı yükləyin və ya sualları birbaşa yapışdırın',
    'upload.uploadBtn': 'Faylı yüklə',
    'upload.loading': 'Yüklənir...',
    'upload.dragDrop': 'Faylı bura sürükləyin',
    'upload.pasteBtn': 'Və ya JSON birbaşa yapışdırın',
    'upload.loadBtn': 'JSON-u yüklə',
    'upload.cancelBtn': 'İmtina et',
    'upload.errorMsg': 'Sual {index} səhv formatdadır. Tələb olunan: question, answers (array), correct_answer',
    'upload.parseError': 'JSON faylı təhlil edilə bilmədi. Formatı yoxlayın.',
    'upload.parseErrorPaste': 'JSON təhlil edilə bilmədi. Formatı yoxlayın.',
    'upload.fileError': '.json faylı yükləyin',
    'upload.format': 'Gözlənilən JSON formatı:',
    'upload.formatDesc': 'question, answers (array) və correct_answer sahələri olan massiv və ya obyekt.',

    // Library
    'library.title': 'Kitabxananız',
    'library.empty': 'Hələ yadda saxlanılan kviz yoxdur',
    'library.saveBtn': 'Kitabxanaya saxla',
    'library.loadBtn': 'Yüklə',
    'library.deleteBtn': 'Sil',
    'library.namePlaceholder': 'Kviz adını daxil edin...',
    'library.saveSuccess': 'Kviz yadda saxlanıldı!',
    'library.confirmDelete': 'Əminsiniz?',
    'library.saved': 'Yadda Saxlanılanlar',
    'library.startBtn': 'Kvizi Başlat',
    'library.cancelBtn': 'İmtina et',

    // Quiz Setup
    'setup.title': 'Rejim seçin',
    'setup.subtitle': 'Kviz rejimini seçin və ayarları tənzimləyin',
    'setup.mode.quick': 'Sürətli Kviz',
    'setup.mode.quickDesc': 'Seçdiyiniz sayda sual, qarışıq',
    'setup.mode.sequential': 'Ardıcıl',
    'setup.mode.sequentialDesc': 'Bütün suallar sıra ilə',
    'setup.mode.practice': 'Məşq Rejimi',
    'setup.mode.practiceDesc': 'Bütün suallar qarışıq, təkrar yoxdur',
    'setup.numQuestions': 'Sualların sayı',
    'setup.available': 'Mövcud: {count} sual',
    'setup.shuffle': 'Cavab variantlarını qarışdır',
    'setup.startBtn': 'Kvizi Başlat',
    'setup.progress': 'Tamamlandı: {answered} / {total}',
    'setup.resetProgress': 'Proqresi sıfırla',
    'setup.mode.study': 'Öyrənmə Rejimi',
    'setup.mode.studyDesc': 'Düzgün cavablar vurğulanmış şəkildə bütün sualları nəzərdən keçirin',

    // Quiz Display
    'quiz.nextQuestion': 'Sonrakı Sual',
    'quiz.finish': 'Bitir',
    'quiz.questionOf': 'Sual',
    'quiz.of': 'dən',
    'quiz.score': 'Bal',

    // Results
    'results.title': 'Kviz Tamamlandı!',
    'results.scored': '{score} dən {total} sual doğru cavab verdiniz',
    'results.resetBtn': 'Yeni Kviz Başlat',
    'results.incorrectTitle': 'Səhv Cavablar',
    'results.yourAnswer': 'Sizin Cavab:',
    'results.correctAnswer': 'Doğru Cavab:',
    'results.perfectScore': 'Mükəmməl! Səhv cavab yoxdur.',

    // Theme/Language
    'theme.darkMode': 'Qaranlıq rejim',
    'theme.lightMode': 'Aydın rejim',
    'lang.azerbaijani': 'AZ',
    'lang.english': 'EN',
  },
}

export function getTranslation(lang: Language, key: string, params?: Record<string, string | number>): string {
  let text = translations[lang][key as keyof typeof translations.en] || translations.en[key as keyof typeof translations.en] || key

  if (params) {
    Object.entries(params).forEach(([k, v]) => {
      text = text.replace(`{${k}}`, String(v))
    })
  }

  return text
}
