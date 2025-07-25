import { getLocales } from 'expo-localization';
import { I18n } from 'i18n-js';

// Traductions pour les différentes langues
const translations = {
  fr: {
    // Navigation
    home: 'Accueil',
    chats: 'Chats',
    settings: 'Paramètres',
    vip: 'VIP',
    
    // Écran d'accueil
    appName: 'MyCompanion',
    appDescription: 'MyCompanion appelle votre Senior quotidiennement et vous tient informé.',
    learnMore: 'En savoir plus...',
    expires: 'Expire',
    days: 'Jours',
    designedWith: 'Conçu avec',
    forOurSeniors: 'pour nos seniors',
    version: 'Version',
    build: 'Build',
    
    // Connexion/Inscription
    connection: 'Connexion',
    registration: 'Inscription',
    email: 'Email',
    password: 'Mot de passe',
    confirmPassword: 'Confirmer le mot de passe',
    signIn: 'Se connecter',
    signUp: 'S\'inscrire',
    signOut: 'Se déconnecter',
    signInAsVip: 'Se connecter en tant que VIP 👑',
    
    // Messages d'erreur
    success: 'Succès',
    pleaseFillAllFields: 'Veuillez remplir tous les champs',
    connectionFailed: 'Échec de la connexion',
    anErrorOccurred: 'Une erreur est survenue',
    connectionSuccessful: 'Connexion réussie !',
    
    // Chat
    chat: 'Chat',
    typeYourMessage: 'Tapez votre message...',
    send: 'Envoyer',
    sending: 'Envoi...',
    scrollToBottom: 'Faire défiler vers le bas',
    messageSent: 'Message envoyé',
    messageFailed: 'Échec d\'envoi',
    retry: 'Réessayer',
    cancel: 'Annuler',
    sendingError: 'Impossible d\'envoyer le message. Vérifiez votre connexion.',
    typing: 'En train d\'écrire...',
    
    // Paramètres
    callSettings: 'Paramètres d\'appel',
    notifications: 'Notifications',
    deleteAccount: 'Supprimer le compte',
    contactSupport: 'Contacter le support',
    resetOnboarding: 'Réinitialiser l\'onboarding',
    
    // Paramètres d'appel
    yourSelfTimezone: 'Fuseau horaire de votre Senior',
    timezone: 'Fuseau horaire',
    daysOfWeek: 'Jours',
    monday: 'Lundi',
    tuesday: 'Mardi',
    wednesday: 'Mercredi',
    thursday: 'Jeudi',
    friday: 'Vendredi',
    saturday: 'Samedi',
    sunday: 'Dimanche',
    
    // Paramètres de notifications
    ifWeNoticeLowMood: 'Si nous remarquons une humeur basse',
    ifWeDetectLowMood: 'Si nous détectons que votre Senior semble triste.',
    ifSeveralCallsMissed: 'Si plusieurs appels sont manqués',
    ifOurCallMissed: 'Si notre appel est manqué, nous réessayerons toutes les heures.',
    ifWeDetectNewTopic: 'Si nous détectons un nouveau sujet à discuter',
    ifWeDetectNewTopicInterest: 'Si nous détectons un nouveau sujet d\'intérêt.',
    
    // Statut
    status: 'Statut',
    
    // Langue
    language: 'Langue',
    
    // Modal
    openModal: 'Ouvrir modal',
    openModalDisabled: 'Ouvrir modal (désactivé)',
    
    // Liens
    links: 'Liens',
    aboutSearchPrivacy: 'À propos de la recherche et de la confidentialité...',
    
    // Messages de chat par défaut
    defaultMessages: {
      greeting: 'Salut ! Comment ça va ?',
      response: 'Très bien merci ! Et toi ?',
      followUp: 'Parfait ! Tu veux qu\'on discute de quelque chose en particulier aujourd\'hui ? J\'ai hâte d\'entendre tes idées !',
      project: 'Oui, j\'aimerais parler de notre projet !',
      autoReplies: [
        'C\'est très intéressant ! Peux-tu m\'en dire plus ?',
        'Je comprends. Comment puis-je t\'aider ?',
        'Excellente idée ! Continuons sur ce sujet.',
        'Merci pour ce partage. Que penses-tu de la suite ?',
        'C\'est passionnant ! J\'ai hâte d\'en savoir plus.'
      ]
    },
    
    // Contacts
    selectedContact: 'Contact sélectionné',
    selectContact: 'Sélectionner un contact',
    selectContactDescription: 'Choisissez un contact pour l\'afficher sur la page d\'accueil',
    contactSelected: 'Contact sélectionné',
    chooseNumber: 'Choisir un numéro',
    selectNumberFor: 'Sélectionnez un numéro pour',
    permissionDenied: 'Permission refusée',
    contactsPermissionRequired: 'L\'accès aux contacts est nécessaire pour sélectionner un contact.',
    error: 'Erreur',
    cannotLoadContacts: 'Impossible de charger les contacts.',
    noContactsFound: 'Aucun contact trouvé ou permission refusée',
    loadingContacts: 'Chargement des contacts...',
    phoneNumbers: 'numéro de téléphone',
    phoneNumbersPlural: 'numéros de téléphone',
    removeContact: 'Supprimer le contact',
    contactRemoved: 'Contact supprimé',
    confirmRemoveContact: 'Êtes-vous sûr de vouloir supprimer',
    cancel: 'Annuler',
    remove: 'Supprimer'
  },
  en: {
    // Navigation
    home: 'Home',
    chats: 'Chats',
    settings: 'Settings',
    vip: 'VIP',
    
    // Home screen
    appName: 'MyCompanion',
    appDescription: 'MyCompanion calls your Senior daily and keeps you informed.',
    learnMore: 'Learn more...',
    expires: 'Expires',
    days: 'Days',
    designedWith: 'Designed with',
    forOurSeniors: 'for our seniors',
    version: 'Version',
    build: 'Build',
    
    // Login/Registration
    connection: 'Connection',
    registration: 'Registration',
    email: 'Email',
    password: 'Password',
    confirmPassword: 'Confirm password',
    signIn: 'Sign in',
    signUp: 'Sign up',
    signOut: 'Sign out',
    signInAsVip: 'Sign in as VIP 👑',
    
    // Error messages
    success: 'Success',
    pleaseFillAllFields: 'Please fill all fields',
    connectionFailed: 'Connection failed',
    anErrorOccurred: 'An error occurred',
    connectionSuccessful: 'Connection successful!',
    
    // Chat
    chat: 'Chat',
    typeYourMessage: 'Type your message...',
    send: 'Send',
    sending: 'Sending...',
    scrollToBottom: 'Scroll to bottom',
    messageSent: 'Message sent',
    messageFailed: 'Message failed',
    retry: 'Retry',
    cancel: 'Cancel',
    sendingError: 'Unable to send message. Check your connection.',
    typing: 'Typing...',
    
    // Settings
    callSettings: 'Call Settings',
    notifications: 'Notifications',
    deleteAccount: 'Delete Account',
    contactSupport: 'Contact Support',
    resetOnboarding: 'Reset Onboarding',
    
    // Call settings
    yourSelfTimezone: 'Your self timezone',
    timezone: 'Timezone',
    daysOfWeek: 'Days',
    monday: 'Monday',
    tuesday: 'Tuesday',
    wednesday: 'Wednesday',
    thursday: 'Thursday',
    friday: 'Friday',
    saturday: 'Saturday',
    sunday: 'Sunday',
    
    // Notification settings
    ifWeNoticeLowMood: 'If we notice a low mood',
    ifWeDetectLowMood: 'If we detect that your self seems down.',
    ifSeveralCallsMissed: 'If several calls are missed',
    ifOurCallMissed: 'If our call is missed, we\'ll try again every hour.',
    ifWeDetectNewTopic: 'If we detect a new topic to discuss',
    ifWeDetectNewTopicInterest: 'If we detect a new topic of interest.',
    
    // Status
    status: 'Status',
    
    // Language
    language: 'Language',
    
    // Modal
    openModal: 'Open modal',
    openModalDisabled: 'Open modal (disabled)',
    
    // Links
    links: 'Links',
    aboutSearchPrivacy: 'About Search & Privacy...',
    
    // Default chat messages
    defaultMessages: {
      greeting: 'Hi! How are you?',
      response: 'Very well, thank you! And you?',
      followUp: 'Perfect! Do you want to discuss something specific today? I\'m looking forward to hearing your ideas!',
      project: 'Yes, I\'d like to talk about our project!',
      autoReplies: [
        'That\'s very interesting! Can you tell me more?',
        'I understand. How can I help you?',
        'Excellent idea! Let\'s continue on this subject.',
        'Thank you for sharing. What do you think about what\'s next?',
        'That\'s exciting! I can\'t wait to learn more.'
      ]
    },
    
    // Contacts
    selectedContact: 'Selected Contact',
    selectContact: 'Select Contact',
    selectContactDescription: 'Choose a contact to display on the home page',
    contactSelected: 'Contact Selected',
    chooseNumber: 'Choose Number',
    selectNumberFor: 'Select a number for',
    permissionDenied: 'Permission Denied',
    contactsPermissionRequired: 'Access to contacts is required to select a contact.',
    cannotLoadContacts: 'Unable to load contacts.',
    noContactsFound: 'No contacts found or permission denied',
    loadingContacts: 'Loading contacts...',
    phoneNumbers: 'phone number',
    phoneNumbersPlural: 'phone numbers',
    removeContact: 'Remove contact',
    contactRemoved: 'Contact removed',
    confirmRemoveContact: 'Are you sure you want to remove',
    cancel: 'Cancel',
    remove: 'Remove'
  }
};

// Créer l'instance i18n
const i18n = new I18n(translations);

// Définir la locale au début de l'app
i18n.locale = getLocales()[0].languageCode ?? 'fr';

// Activer le fallback pour les traductions manquantes
i18n.enableFallback = true;

export default i18n; 