import { useState } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { signIn, signUp, type UserSession } from '../lib/api';

interface AuthScreenProps {
  onAuthenticated: (session: UserSession) => void;
  onGuest: () => void;
}

export default function AuthScreen({ onAuthenticated, onGuest }: AuthScreenProps) {
  const [mode, setMode] = useState<'signin' | 'signup'>('signin');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      const session = mode === 'signin' ? await signIn(username, password) : await signUp(username, password);
      onAuthenticated(session);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-amber-50 to-amber-100 flex flex-col items-center justify-center p-8">
      <Card className="w-full max-w-sm bg-amber-50/90 border-amber-300">
        <CardHeader>
          <CardTitle className="text-2xl text-amber-900 text-center">
            🏴‍☠️ Treasure Hunt Game 🏴‍☠️
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div className="flex flex-col gap-2">
              <Label htmlFor="username">Username</Label>
              <Input
                id="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                autoComplete="username"
                required
              />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete={mode === 'signin' ? 'current-password' : 'new-password'}
                required
              />
            </div>

            {error && <p className="text-sm text-red-600">{error}</p>}

            <Button type="submit" disabled={submitting} className="bg-amber-600 hover:bg-amber-700 text-white">
              {mode === 'signin' ? 'Sign In' : 'Sign Up'}
            </Button>

            <button
              type="button"
              onClick={() => {
                setMode(mode === 'signin' ? 'signup' : 'signin');
                setError(null);
              }}
              className="text-sm text-amber-700 underline"
            >
              {mode === 'signin' ? "Don't have an account? Sign up" : 'Already have an account? Sign in'}
            </button>

            <div className="border-t border-amber-300 pt-4">
              <Button type="button" variant="outline" onClick={onGuest} className="w-full">
                Continue as Guest
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
