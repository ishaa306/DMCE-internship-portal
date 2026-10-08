import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

function Register() {
  const navigate = useNavigate()

  const [form, setForm] = useState({
    gr_no: '',
    name: '',
    email: '',
    password: '',
    address: ''
  })

  const [profile, setProfile] = useState(null)
  const [cv, setCV] = useState(null)

  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  const handleFileChange = (e) => {
    const { name, files } = e.target
    if (name === 'profile') setProfile(files[0])
    if (name === 'cv') setCV(files[0])
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setSuccess('')

    try {
      // Step 1: Register user
      const res = await fetch('https://placement-portal-backend.ramshekade20.workers.dev/api/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form)
      })

      const data = await res.json()

      if (!res.ok) {
        console.error('Registration failed:', data)
        setError(data.error || 'Registration failed')
        return
      }

      // Step 2: Upload files (if both present)
      if (profile && cv) {
        const uploadForm = new FormData()
        uploadForm.append('gr_no', form.gr_no)
        uploadForm.append('profile', profile)
        uploadForm.append('cv', cv)

        const uploadRes = await fetch('https://placement-portal-backend.ramshekade20.workers.dev/api/upload', {
          method: 'POST',
          body: uploadForm
        })

        const uploadData = await uploadRes.json()

        if (!uploadRes.ok) {
          console.error('Upload failed:', uploadData)
          setError('User registered but file upload failed: ' + (uploadData.error || 'Unknown error'))
          return
        }
      }

      setSuccess('Registration complete!')
      setTimeout(() => navigate('/'), 2000)

    } catch (err) {
      console.error('Error in registration:', err)
      setError('Something went wrong. Please try again.')
    }
  }

  return (
    <div style={{ maxWidth: '400px', margin: '50px auto' }}>
      <h2>Register</h2>
      <form onSubmit={handleSubmit} encType="multipart/form-data">
        <input type="text" name="gr_no" placeholder="GR No" onChange={handleChange} required /><br />
        <input type="text" name="name" placeholder="Name" onChange={handleChange} required /><br />
        <input type="email" name="email" placeholder="Email" onChange={handleChange} required /><br />
        <input type="password" name="password" placeholder="Password" onChange={handleChange} required /><br />
        <input type="text" name="address" placeholder="Address" onChange={handleChange} /><br />
        <label>Profile Photo: </label><br />
        <input type="file" name="profile" accept="image/*" onChange={handleFileChange} required /><br />
        <label>CV (PDF): </label><br />
        <input type="file" name="cv" accept="application/pdf" onChange={handleFileChange} required /><br />
        <button type="submit">Register</button>
      </form>

      {error && <p style={{ color: 'red' }}>{error}</p>}
      {success && <p style={{ color: 'green' }}>{success}</p>}
    </div>
  )
}

export default Register
