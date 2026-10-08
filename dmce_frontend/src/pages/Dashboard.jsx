import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'

function Dashboard() {
  const navigate = useNavigate()
  const [user, setUser] = useState(null)
  const [form, setForm] = useState({})
  const [profile, setProfile] = useState(null)
  const [cv, setCV] = useState(null)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')

  const gr_no = localStorage.getItem('gr_no')
  const token = localStorage.getItem('token')

  useEffect(() => {
    if (!token || !gr_no) {
      navigate('/')
      return
    }

    fetch(`https://placement-portal-backend.ramshekade20.workers.dev/api/profile?gr_no=${gr_no}`)
      .then(res => res.json())
      .then(data => {
        if (data.user) {
          setUser(data.user)
          setForm({
            name: data.user.name,
            email: data.user.email,
            address: data.user.address || ''
          })
        } else {
          setError(data.error || 'Failed to load user')
        }
      })
      .catch(() => setError('Something went wrong'))
  }, [])

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  const handleFileChange = (e) => {
    const { name, files } = e.target
    if (name === 'profile') setProfile(files[0])
    if (name === 'cv') setCV(files[0])
  }

  const handleUpdate = async (e) => {
    e.preventDefault()
    setMessage('')
    setError('')

    try {
      // Update profile details
      const res = await fetch('https://placement-portal-backend.ramshekade20.workers.dev/api/profile/update', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ gr_no, ...form })
      })

      const result = await res.json()
      if (!res.ok) return setError(result.error || 'Update failed')

      // Upload files if selected
      if (profile || cv) {
        const uploadForm = new FormData()
        uploadForm.append('gr_no', gr_no)
        if (profile) uploadForm.append('profile', profile)
        if (cv) uploadForm.append('cv', cv)

        const uploadRes = await fetch('https://placement-portal-backend.ramshekade20.workers.dev/api/upload', {
          method: 'POST',
          body: uploadForm
        })

        const uploadResult = await uploadRes.json()
        if (!uploadRes.ok) return setError(uploadResult.error || 'File upload failed')
      }

      setMessage('Profile updated successfully!')
      setTimeout(() => {
        window.location.reload()
      }, 1000)
    } catch (err) {
      setError('Something went wrong')
    }
  }

  const handleLogout = () => {
    localStorage.clear()
    navigate('/')
  }

  if (!user) return <p>Loading...</p>

  return (
    <div style={{ maxWidth: '600px', margin: '50px auto' }}>
      <h2>Edit Profile - {user.gr_no}</h2>
      <form onSubmit={handleUpdate} encType="multipart/form-data">
        <input type="text" name="name" value={form.name} onChange={handleChange} placeholder="Name" required /><br />
        <input type="email" name="email" value={form.email} onChange={handleChange} placeholder="Email" required /><br />
        <input type="text" name="address" value={form.address} onChange={handleChange} placeholder="Address" /><br />

        <label>Replace Profile Photo:</label><br />
        <input type="file" name="profile" accept="image/*" onChange={handleFileChange} /><br />
        <label>Replace CV (PDF):</label><br />
        <input type="file" name="cv" accept="application/pdf" onChange={handleFileChange} /><br />

        <button type="submit">Update Profile</button>
      </form>

      <br />
      <p><strong>Current Profile Photo:</strong></p>
      {user.profile_photo_url && <img src={user.profile_photo_url} width="150" />}
      <p><strong>Current CV:</strong> {user.cv_url && <a href={user.cv_url} target="_blank">View CV</a>}</p>

      <br />
      {message && <p style={{ color: 'green' }}>{message}</p>}
      {error && <p style={{ color: 'red' }}>{error}</p>}

      <button onClick={handleLogout}>Logout</button>
    </div>
  )
}

export default Dashboard
