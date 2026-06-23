import axiosInstance from './axiosInstance'

export const adminService = {
  // 🔐 Authentification alignée sur ton DTO UniPay
  login: async (email, password) => {
    // On envoie 'identifiant' et 'motDePasse' pour valider le schéma Joi backend
    const response = await axiosInstance.post('/auth/login', { 
      identifiant: email, 
      motDePasse: password 
    })
    return response.data // Renvoie { success: true, data: { token, utilisateur } }
  },

  // 💰 Module : Trésorerie & Clôture (Ce qu'on a rappelé plus tôt)
  declencherCloture: async () => {
    const response = await axiosInstance.post('/cloture')
    return response.data
  },

  recupererFondsDuCoffre: async () => {
    const response = await axiosInstance.post('/recuperer-fonds')
    return response.data
  },

  // 🔀 Module : Agrégateurs Partenaires
  creerAgregateur: async (data) => {
    const response = await axiosInstance.post('/agregateurs', data)
    return response.data
  },

  toggleAgregateurStatut: async (id, statut) => {
    // payload contenant le nouveau statut à modifier via ton router.patch
    const response = await axiosInstance.patch(`/agregateurs/${id}/statut`, { statut })
    return response.data
  }
}