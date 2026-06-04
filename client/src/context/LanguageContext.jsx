import { createContext, useContext, useState } from 'react';

const T = {
  en: {
    // Navbar
    market: 'Market', buzz: '📢 Buzz', myStands: 'My Stands',
    logIn: 'Log In', joinFree: 'Join Free',

    // Hero
    heroTagline: 'The Digital Central Market of Cameroon',
    heroTitle: 'Welcome to ETOH Market',
    heroSubtitle: 'Buy and sell fresh produce, fashion, electronics, cars, furniture and more from local Cameroonian vendors — safe, simple, affordable.',
    openMyStand: '🏪 Open My Stand',
    watchReels: '▶ Watch Reels',

    // Stats
    activeStands: 'Active Stands', productsListed: 'Products Listed',
    reelsLabel: 'Reels', localCurrency: 'Local Currency',

    // Filters
    filterByRegion: '📍 Filter by Region', allCities: '🌍 All Cities',
    categoryLabel: '🏷️ Category', allProducts: '🛍️ All',
    productsTab: 'Products', standsTab: 'Stands',
    showing: 'Showing:', clearAll: 'Clear all',

    // Empty states
    noProductsMatch: 'No products match your filters',
    tryDifferent: 'Try a different region or category.',
    clearFilters: 'Clear Filters',
    noStandsArea: 'No stands in this area',
    tryDifferentCity: 'Try a different city filter.',

    // Market Buzz banner
    buzzBannerLabel: 'Market Buzz',
    buzzBannerTitle: '🎬 Short Videos from Cameroon Vendors',
    buzzBannerDesc: 'Watch product demos, market tips, and vendor stories — scroll like TikTok.',

    // Product detail
    productVideo: '🎬 Product Video',
    voiceNote: '🎙️ Bayam-Sellam Voice Note',
    voiceNoteDesc: 'Listen to the seller describe this product.',
    contactSafely: '📞 Contact Seller Safely',
    chatWhatsApp: '📱 Chat on WhatsApp',
    safetyNote: 'Always meet in public. Never pay before inspecting.',
    requestDelivery: '🛵 Request Delivery',
    yourFullName: 'Your Full Name', deliveryCity: 'Delivery City',
    quarterLabel: 'Quarter / Neighbourhood', nearestLandmark: 'Nearest Landmark',
    landmarkHint: 'Be specific so the delivery rider finds you easily!',
    placingOrder: 'Placing order...', placeOrder: '🛵 Place Order',
    fillAllFields: 'Please fill all delivery fields.',

    // Bargain Calculator
    bargainTitle: '🤝 Suggest a Price',
    bargainSubtitle: 'Tap an offer to copy it to your message',
    cool: 'Cool', fair: 'Fair', aggressive: 'Aggressive', offLabel: 'off',
    copyMsg: 'Copy offer message', copiedMsg: '✅ Copied!',
    bargainMsg: (name, price) => `Hi! I'm interested in "${name}". Would you accept ${price.toLocaleString()} CFA?`,

    // Verified badge
    trustedVendor: 'Trusted Vendor',

    // Stand detail
    yourStand: 'Your Stand', contactSeller: '📞 Contact Seller',
    addProduct: '+ Add Product', editStand: '✏️ Edit Stand',
    productsOnStand: 'Products on this Stand',
    noProductsYet: 'No products yet', addFirstProduct: 'Add First Product',

    // Market Buzz page
    marketBuzzTitle: '📢 Market Buzz', postReel: '+ Post',
    noVideoReels: 'No video reels yet',
    beFirstVendor: 'Be the first vendor to post a short video!',
    postFirstReel: 'Post First Reel', logInToPost: 'Log in to Post',
    allCaughtUp: "You're all caught up!",
    checkBackLater: 'Check back later for more reels.',
    postYourReel: '+ Post Your Reel',
    visitStand: 'Visit Stand →',
    shortClips: "Short clips from vendors in Cameroon's digital central market.",
    scrollToReel: 'Scroll to a reel',

    // Buzz upload modal
    postAReelTitle: '🎬 Post a Reel', titleLabel: 'Title *',
    titlePlaceholder: "What's in this video?",
    captionLabel: 'Caption', captionPlaceholder: 'Tell people more...',
    linkStand: 'Link Stand', noStandLink: '-- No stand link --',
    videoFileLabel: 'Video File * (MP4, MOV, WebM)',
    clickToSelect: 'Click to select your video',
    publishing: 'Uploading…', publishReel: '🚀 Publish Reel',

    // Profile
    editProfile: '✏️ Edit Your Profile', fullName: 'Full Name', bio: 'Bio',
    whatsAppNumber: 'WhatsApp Number', profilePicture: 'Profile Picture',
    addBio: 'Add a bio below to tell buyers about yourself.',
    clickToUpload: 'Click to upload a new photo (JPG or PNG)',
    saving: 'Saving...', saveProfile: '✅ Save Profile',

    // Auth
    welcomeBack: 'Welcome Back',
    loginSubtitle: 'Log in to manage your ETOH stands and products.',
    emailLabel: 'Email Address', passwordLabel: 'Password',
    loggingIn: 'Logging in...', loginBtn: '🔑 Log In',
    noAccount: "Don't have an account?", createFree: 'Create one free',
    createAccount: 'Create Your Account',
    registerSubtitle: 'Join ETOH and open your virtual market stand today.',
    nameLabel: 'Full Name', confirmPassword: 'Confirm Password',
    pwMismatch: 'Passwords do not match.',
    registering: 'Creating account...', registerBtn: '🚀 Create Account',
    hasAccount: 'Already have an account?', logInLink: 'Log in',

    // Admin
    verifyStand: '✓ Verify', unverifyStand: '✗ Remove',
  },

  fr: {
    // Navbar
    market: 'Marché', buzz: '📢 Buzz', myStands: 'Mes Stands',
    logIn: 'Connexion', joinFree: 'Rejoindre',

    // Hero
    heroTagline: 'Le Marché Central Numérique du Cameroun',
    heroTitle: 'Bienvenue sur ETOH Market',
    heroSubtitle: "Achetez et vendez des produits frais, de la mode, de l'électronique, des voitures, des meubles et plus encore auprès de vendeurs locaux — sûr, simple, abordable.",
    openMyStand: '🏪 Ouvrir mon Stand',
    watchReels: '▶ Voir les Reels',

    // Stats
    activeStands: 'Stands Actifs', productsListed: 'Produits Listés',
    reelsLabel: 'Reels', localCurrency: 'Monnaie Locale',

    // Filters
    filterByRegion: '📍 Filtrer par Région', allCities: '🌍 Toutes les Villes',
    categoryLabel: '🏷️ Catégorie', allProducts: '🛍️ Tout',
    productsTab: 'Produits', standsTab: 'Stands',
    showing: 'Affichage :', clearAll: 'Tout effacer',

    // Empty states
    noProductsMatch: 'Aucun produit ne correspond à vos filtres',
    tryDifferent: 'Essayez une région ou catégorie différente.',
    clearFilters: 'Effacer les Filtres',
    noStandsArea: 'Aucun stand dans cette zone',
    tryDifferentCity: 'Essayez un filtre de ville différent.',

    // Market Buzz banner
    buzzBannerLabel: 'Market Buzz',
    buzzBannerTitle: '🎬 Courtes Vidéos de Vendeurs Camerounais',
    buzzBannerDesc: 'Regardez des démos de produits, conseils de marché et histoires de vendeurs — défilez comme TikTok.',

    // Product detail
    productVideo: '🎬 Vidéo du Produit',
    voiceNote: '🎙️ Note Vocale Bayam-Sellam',
    voiceNoteDesc: 'Écoutez le vendeur décrire ce produit.',
    contactSafely: '📞 Contacter le Vendeur',
    chatWhatsApp: '📱 Chat WhatsApp',
    safetyNote: 'Toujours se rencontrer en public. Ne jamais payer avant inspection.',
    requestDelivery: '🛵 Demander une Livraison',
    yourFullName: 'Votre Nom Complet', deliveryCity: 'Ville de Livraison',
    quarterLabel: 'Quartier', nearestLandmark: 'Repère le Plus Proche',
    landmarkHint: 'Soyez précis pour que le livreur vous trouve facilement !',
    placingOrder: 'Commande en cours...', placeOrder: '🛵 Passer la Commande',
    fillAllFields: 'Veuillez remplir tous les champs de livraison.',

    // Bargain Calculator
    bargainTitle: '🤝 Proposer un Prix',
    bargainSubtitle: "Appuyez sur une offre pour la copier dans votre message",
    cool: 'Cool', fair: 'Équitable', aggressive: 'Agressif', offLabel: 'rabais',
    copyMsg: "Copier le message d'offre", copiedMsg: '✅ Copié !',
    bargainMsg: (name, price) => `Bonjour ! Je suis intéressé(e) par "${name}". Accepteriez-vous ${price.toLocaleString()} CFA ?`,

    // Verified badge
    trustedVendor: 'Vendeur Certifié',

    // Stand detail
    yourStand: 'Votre Stand', contactSeller: '📞 Contacter le Vendeur',
    addProduct: '+ Ajouter Produit', editStand: '✏️ Modifier le Stand',
    productsOnStand: 'Produits sur ce Stand',
    noProductsYet: 'Aucun produit pour l\'instant', addFirstProduct: 'Ajouter le Premier Produit',

    // Market Buzz page
    marketBuzzTitle: '📢 Market Buzz', postReel: '+ Publier',
    noVideoReels: 'Aucune vidéo pour le moment',
    beFirstVendor: 'Soyez le premier vendeur à publier une courte vidéo !',
    postFirstReel: 'Premier Reel', logInToPost: 'Connexion',
    allCaughtUp: 'Vous êtes à jour !',
    checkBackLater: 'Revenez plus tard pour plus de reels.',
    postYourReel: '+ Publier votre Reel',
    visitStand: 'Visiter le Stand →',
    shortClips: 'Courtes vidéos de vendeurs du marché central numérique du Cameroun.',
    scrollToReel: 'Faites défiler vers un reel',

    // Buzz upload modal
    postAReelTitle: '🎬 Publier un Reel', titleLabel: 'Titre *',
    titlePlaceholder: 'Que montre cette vidéo ?',
    captionLabel: 'Légende', captionPlaceholder: 'Dites-en plus...',
    linkStand: 'Lier un Stand', noStandLink: '-- Aucun stand --',
    videoFileLabel: 'Fichier Vidéo * (MP4, MOV, WebM)',
    clickToSelect: 'Cliquez pour sélectionner votre vidéo',
    publishing: 'Envoi en cours…', publishReel: '🚀 Publier le Reel',

    // Profile
    editProfile: '✏️ Modifier votre Profil', fullName: 'Nom Complet', bio: 'Bio',
    whatsAppNumber: 'Numéro WhatsApp', profilePicture: 'Photo de Profil',
    addBio: 'Ajoutez une bio pour parler de vous aux acheteurs.',
    clickToUpload: 'Cliquez pour télécharger une nouvelle photo (JPG ou PNG)',
    saving: 'Enregistrement...', saveProfile: '✅ Sauvegarder le Profil',

    // Auth
    welcomeBack: 'Bon Retour',
    loginSubtitle: 'Connectez-vous pour gérer vos stands et produits.',
    emailLabel: 'Adresse Email', passwordLabel: 'Mot de passe',
    loggingIn: 'Connexion...', loginBtn: '🔑 Se Connecter',
    noAccount: "Vous n'avez pas de compte ?", createFree: 'Créer un compte gratuit',
    createAccount: 'Créer votre Compte',
    registerSubtitle: 'Rejoignez ETOH et ouvrez votre stand virtuel dès aujourd\'hui.',
    nameLabel: 'Nom Complet', confirmPassword: 'Confirmer le Mot de passe',
    pwMismatch: 'Les mots de passe ne correspondent pas.',
    registering: 'Création du compte...', registerBtn: '🚀 Créer un Compte',
    hasAccount: 'Vous avez déjà un compte ?', logInLink: 'Se connecter',

    // Admin
    verifyStand: '✓ Certifier', unverifyStand: '✗ Retirer',
  },
};

const LanguageContext = createContext();

export function LanguageProvider({ children }) {
  const [lang, setLang] = useState(() => localStorage.getItem('etoh_lang') || 'en');

  function toggle() {
    setLang(l => {
      const next = l === 'en' ? 'fr' : 'en';
      localStorage.setItem('etoh_lang', next);
      return next;
    });
  }

  function t(key, ...args) {
    const val = T[lang]?.[key] ?? T.en?.[key] ?? key;
    return typeof val === 'function' ? val(...args) : val;
  }

  return (
    <LanguageContext.Provider value={{ lang, t, toggle }}>
      {children}
    </LanguageContext.Provider>
  );
}

export const useLang = () => useContext(LanguageContext);
