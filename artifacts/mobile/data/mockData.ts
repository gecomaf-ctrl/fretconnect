export interface Freight {
  id: string;
  origin: string;
  destination: string;
  cargo: string;
  weight: number;
  distance: number;
  budget: number;
  status: 'published' | 'offers_received' | 'carrier_selected' | 'in_transit' | 'delivered' | 'cancelled';
  date: string;
  vehicleType: string;
  offersCount: number;
  ownerId: string;
  ownerName: string;
}

export interface Mission extends Freight {
  myOfferAmount?: number;
  missionStatus: 'available' | 'offer_sent' | 'accepted' | 'in_progress' | 'completed';
}

export interface Conversation {
  id: string;
  participantName: string;
  lastMessage: string;
  timestamp: string;
  unread: number;
  freightLabel: string;
  isOnline: boolean;
}

export interface AppNotification {
  id: string;
  type: 'offer' | 'accepted' | 'rejected' | 'kyc' | 'payment' | 'delivery' | 'message';
  title: string;
  body: string;
  timestamp: string;
  read: boolean;
}

export interface Transaction {
  id: string;
  type: 'credit' | 'debit' | 'commission';
  amount: number;
  description: string;
  date: string;
  status: 'completed' | 'pending';
}

export const MOCK_FREIGHTS: Freight[] = [
  {
    id: 'f1', origin: 'Abidjan, Plateau', destination: 'Bouaké Centre',
    cargo: 'Produits alimentaires', weight: 2500, distance: 345, budget: 180000,
    status: 'offers_received', date: '2026-07-05', vehicleType: 'Camion 5T',
    offersCount: 3, ownerId: 'user_1', ownerName: 'Kofi Mensah',
  },
  {
    id: 'f2', origin: 'Abidjan, Yopougon', destination: 'San Pedro',
    cargo: 'Matériaux de construction', weight: 8000, distance: 430, budget: 350000,
    status: 'published', date: '2026-07-06', vehicleType: 'Camion 10T',
    offersCount: 0, ownerId: 'user_1', ownerName: 'Kofi Mensah',
  },
  {
    id: 'f3', origin: 'Abidjan, Cocody', destination: 'Yamoussoukro',
    cargo: 'Électroménager', weight: 1200, distance: 248, budget: 95000,
    status: 'in_transit', date: '2026-07-04', vehicleType: 'Camionnette',
    offersCount: 1, ownerId: 'user_1', ownerName: 'Kofi Mensah',
  },
  {
    id: 'f4', origin: 'Abidjan, Marcory', destination: 'Daloa',
    cargo: 'Produits cosmétiques', weight: 800, distance: 392, budget: 120000,
    status: 'delivered', date: '2026-07-01', vehicleType: 'Pick-up',
    offersCount: 2, ownerId: 'user_1', ownerName: 'Kofi Mensah',
  },
];

export const MOCK_MISSIONS: Mission[] = [
  {
    id: 'm1', origin: 'Abidjan, Treichville', destination: 'Man',
    cargo: 'Céréales en sacs', weight: 5000, distance: 520, budget: 280000,
    status: 'published', date: '2026-07-05', vehicleType: 'Camion 5T',
    offersCount: 2, ownerId: 'user_2', ownerName: 'Amara Diallo',
    missionStatus: 'available',
  },
  {
    id: 'm2', origin: 'Abidjan, Abobo', destination: 'Korhogo',
    cargo: 'Textiles', weight: 2000, distance: 638, budget: 320000,
    status: 'published', date: '2026-07-06', vehicleType: 'Camion 5T',
    offersCount: 1, ownerId: 'user_3', ownerName: 'Fatou Camara',
    missionStatus: 'offer_sent', myOfferAmount: 290000,
  },
  {
    id: 'm3', origin: 'Bouaké', destination: 'Abidjan, Port',
    cargo: 'Cacao en fèves', weight: 12000, distance: 345, budget: 450000,
    status: 'published', date: '2026-07-07', vehicleType: 'Semi-remorque',
    offersCount: 4, ownerId: 'user_4', ownerName: 'Ibrahima Sow',
    missionStatus: 'available',
  },
  {
    id: 'm4', origin: 'San Pedro', destination: 'Abidjan, Adjamé',
    cargo: 'Bois de construction', weight: 15000, distance: 390, budget: 520000,
    status: 'published', date: '2026-07-08', vehicleType: 'Semi-remorque',
    offersCount: 0, ownerId: 'user_5', ownerName: 'Moussa Touré',
    missionStatus: 'available',
  },
];

export const MOCK_CONVERSATIONS: Conversation[] = [
  {
    id: 'c1', participantName: 'Amara Diallo',
    lastMessage: 'Pouvez-vous confirmer l\'heure de départ ?',
    timestamp: '09:45', unread: 2,
    freightLabel: 'Abidjan → Man', isOnline: true,
  },
  {
    id: 'c2', participantName: 'Moussa Touré',
    lastMessage: 'Livraison effectuée avec succès !',
    timestamp: 'Hier', unread: 0,
    freightLabel: 'Abidjan → Yamoussoukro', isOnline: false,
  },
  {
    id: 'c3', participantName: 'Fatou Camara',
    lastMessage: 'Je suis disponible dès demain matin',
    timestamp: 'Hier', unread: 1,
    freightLabel: 'Abidjan → Korhogo', isOnline: true,
  },
  {
    id: 'c4', participantName: 'Ibrahim Coulibaly',
    lastMessage: 'Mon offre : 285 000 FCFA',
    timestamp: 'Lun', unread: 0,
    freightLabel: 'Bouaké → San Pedro', isOnline: false,
  },
];

export const MOCK_NOTIFICATIONS: AppNotification[] = [
  {
    id: 'n1', type: 'offer', title: 'Nouvelle offre reçue',
    body: '3 transporteurs ont soumis une offre pour votre fret Abidjan → Bouaké',
    timestamp: '10 min', read: false,
  },
  {
    id: 'n2', type: 'message', title: 'Message d\'Amara Diallo',
    body: 'Pouvez-vous confirmer l\'heure de départ ?',
    timestamp: '45 min', read: false,
  },
  {
    id: 'n3', type: 'payment', title: 'Paiement reçu',
    body: 'Vous avez reçu 185 000 FCFA pour la livraison Abidjan → Yamoussoukro',
    timestamp: '2h', read: true,
  },
  {
    id: 'n4', type: 'delivery', title: 'Livraison confirmée',
    body: 'Votre fret Abidjan → Yamoussoukro a été livré avec succès',
    timestamp: 'Hier', read: true,
  },
  {
    id: 'n5', type: 'kyc', title: 'Demande en attente',
    body: 'Votre demande de devenir transporteur est en cours de vérification',
    timestamp: '3 jours', read: true,
  },
];

export const MOCK_TRANSACTIONS: Transaction[] = [
  {
    id: 't1', type: 'credit', amount: 185000,
    description: 'Mission Abidjan → Yamoussoukro',
    date: '01/07/2026', status: 'completed',
  },
  {
    id: 't2', type: 'commission', amount: -9250,
    description: 'Commission FretConnect (5%)',
    date: '01/07/2026', status: 'completed',
  },
  {
    id: 't3', type: 'credit', amount: 320000,
    description: 'Mission Abidjan → Korhogo',
    date: '28/06/2026', status: 'completed',
  },
  {
    id: 't4', type: 'debit', amount: -50000,
    description: 'Retrait vers Mobile Money',
    date: '25/06/2026', status: 'completed',
  },
  {
    id: 't5', type: 'credit', amount: 95000,
    description: 'Mission Abidjan → Daloa',
    date: '20/06/2026', status: 'pending',
  },
];
