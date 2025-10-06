export const debugAuth = () => {
  if (typeof window === 'undefined') return

  const token = localStorage.getItem('auth_token')
  const userData = localStorage.getItem('user_data')
  
  console.group('🔐 Auth Debug Info')
  console.log('Has access token:', !!token)
  console.log('Token preview:', token ? `${token.substring(0, 20)}...` : 'None')
  console.log('Has user data:', !!userData)
  console.log('User data:', userData ? JSON.parse(userData) : 'None')
  console.log('Cookies:', document.cookie)
  console.groupEnd()
}

// Add to window for easy debugging in dev tools
if (typeof window !== 'undefined') {
  ;(window as any).debugAuth = debugAuth
}