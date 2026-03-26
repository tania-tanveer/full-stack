import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

const ForgotPassword = () => {
    const [email, setEmail] = useState('')
    const [error, setError] = useState('')
    const [success, setSuccess] = useState('')
    const [resetUrl, setResetUrl] = useState('')
    const [loading, setLoading] = useState(false)
    const { forgotPassword } = useAuth()

    const handleSubmit = async (e) => {
        e.preventDefault()
        setError('')
        setSuccess('')
        setResetUrl('')
        setLoading(true)

        try {
            const data = await forgotPassword(email)
            setSuccess(data.message || 'If your email exists, a reset link has been generated.')
            if (data?.resetUrl) {
                setResetUrl(data.resetUrl)
            }
        } catch (err) {
            const serverMessage = err.response?.data?.error || err.response?.data?.message
            const statusCode = err.response?.status ? ` (HTTP ${err.response.status})` : ''
            setError(serverMessage || `Failed to request password reset${statusCode}`)
        } finally {
            setLoading(false)
        }
    }

    return (
        <section className="auth-page">
            <div className="auth-card">
                <h2>Forgot Password</h2>

                {error && <div className="error-message">{error}</div>}
                {success && <div className="success-message">{success}</div>}

                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label htmlFor="email">Email</label>
                        <input
                            type="email"
                            id="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            placeholder="Enter your account email"
                        />
                    </div>

                    <button type="submit" className="btn btn-primary" disabled={loading}>
                        {loading ? 'Sending...' : 'Send Reset Link'}
                    </button>
                </form>

                {resetUrl && (
                    <p className="auth-switch">
                        Demo reset link: <Link to={resetUrl}>Reset Password</Link>
                    </p>
                )}

                <p className="auth-switch">
                    Remembered your password? <Link to="/login">Back to Sign In</Link>
                </p>
            </div>
        </section>
    )
}

export default ForgotPassword
