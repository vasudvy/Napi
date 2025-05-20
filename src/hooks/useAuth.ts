import { useSupabase } from './useSupabase';
import { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';

export function useAuth() {
  const { supabase } = useSupabase();
  const navigate = useNavigate();

  const signIn = useCallback(async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    
    if (error) throw error;
    
    navigate('/dashboard/agents');
  }, [supabase, navigate]);

  const signUp = useCallback(async (email: string, password: string) => {
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    });
    
    if (error) throw error;
  }, [supabase]);

  const signOut = useCallback(async () => {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
    navigate('/login');
  }, [supabase, navigate]);

  return {
    signIn,
    signUp,
    signOut,
  };
}