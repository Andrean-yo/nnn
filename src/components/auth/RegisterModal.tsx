import { useState } from 'react';
import { X, UserPlus } from 'lucide-react';
import { motion } from 'framer-motion';

interface RegisterModalProps {
    isOpen: boolean;
    onClose: () => void;
    onRegister: (email: string, password: string) => { success: boolean; error?: string };
    onSwitchToLogin: () => void;
}

export function RegisterModal({ isOpen, onClose, onRegister, onSwitchToLogin }: RegisterModalProps) {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState('');

    if (!isOpen) return null;

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        // Validate passwords match
        if (password !== confirmPassword) {
            setError('Passwords do not match');
            return;
        }

        const result = onRegister(email, password);
        if (result.success) {
            setEmail('');
            setPassword('');
            setConfirmPassword('');
            onClose();
        } else {
            setError(result.error || 'Registration failed');
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-sm animate-in fade-in duration-200">
            <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                className="w-full max-w-md bg-[#16191e] border border-white/10 rounded-2xl shadow-2xl overflow-hidden"
            >
                {/* Header */}
                <div className="relative p-6 border-b border-white/5 bg-[#0b0d10]/50">
                    <div className="text-center">
                        <h1 className="text-3xl font-bold bg-gradient-to-r from-primary via-emerald-400 to-primary bg-clip-text text-transparent mb-2">
                            IndraScans
                        </h1>
                        <p className="text-sm text-gray-400">Create your account</p>
                    </div>
                    <button
                        onClick={onClose}
                        className="absolute top-4 right-4 p-2 hover:bg-white/5 rounded-full transition-colors"
                    >
                        <X className="w-5 h-5 text-gray-400" />
                    </button>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    <div className="space-y-2">
                        <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">
                            Email
                        </label>
                        <input
                            type="email"
                            required
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full px-4 py-3 bg-black/40 border border-white/5 rounded-lg focus:border-primary/50 focus:ring-1 focus:ring-primary/50 outline-none transition-all"
                            placeholder="your@email.com"
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">
                            Password
                        </label>
                        <input
                            type="password"
                            required
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full px-4 py-3 bg-black/40 border border-white/5 rounded-lg focus:border-primary/50 focus:ring-1 focus:ring-primary/50 outline-none transition-all"
                            placeholder="••••••••"
                            minLength={6}
                        />
                        <p className="text-xs text-gray-500">Minimum 6 characters</p>
                    </div>

                    <div className="space-y-2">
                        <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">
                            Confirm Password
                        </label>
                        <input
                            type="password"
                            required
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            className="w-full px-4 py-3 bg-black/40 border border-white/5 rounded-lg focus:border-primary/50 focus:ring-1 focus:ring-primary/50 outline-none transition-all"
                            placeholder="••••••••"
                        />
                    </div>

                    {error && (
                        <motion.div
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg"
                        >
                            <p className="text-sm text-red-400">{error}</p>
                        </motion.div>
                    )}

                    <button
                        type="submit"
                        className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-primary text-black font-bold rounded-lg hover:bg-emerald-400 transition-all shadow-[0_0_20px_-5px_rgba(52,211,153,0.3)]"
                    >
                        <UserPlus className="w-5 h-5" />
                        <span>Create Account</span>
                    </button>

                    <div className="text-center pt-2">
                        <p className="text-sm text-gray-400">
                            Already have an account?{' '}
                            <button
                                type="button"
                                onClick={onSwitchToLogin}
                                className="text-primary hover:underline font-medium"
                            >
                                Login here
                            </button>
                        </p>
                    </div>
                </form>
            </motion.div>
        </div>
    );
}
