"use client";
import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";

// Minimal session data we need in the app
export type Session = {
    user: {
        id: string;
        email: string;
        name: string;
        first_name?: string;
        last_name?: string;
    };
    accessToken: string;
};

export function useSession() {
    const [session, setSession] = useState<Session | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        let alive = true;

        async function hydrate() {
            try {
                const { data } = await supabase.auth.getSession();
                const s = data.session;
                if (alive) {
                    if (s?.user) {
                        const user = s.user;
                        const fullName =
                            (user.user_metadata?.full_name || [user.user_metadata?.first_name, user.user_metadata?.last_name].filter(Boolean).join(" ")) ||
                            user.email ||
                            user.id;
                        setSession({
                            user: {
                                id: user.id,
                                email: user.email || "",
                                name: fullName,
                                first_name: user.user_metadata?.first_name,
                                last_name: user.user_metadata?.last_name,
                            },
                            accessToken: s.access_token,
                        });
                    } else {
                        setSession(null);
                    }
                    setLoading(false);
                }
            } catch (err) {
                if (alive) {
                    setSession(null);
                    setLoading(false);
                }
            }
        }

        hydrate();

        const { data: subscription } = supabase.auth.onAuthStateChange((_event, newSession) => {
            if (!alive) return;
            if (newSession?.user) {
                const user = newSession.user;
                const fullName =
                    (user.user_metadata?.full_name || [user.user_metadata?.first_name, user.user_metadata?.last_name].filter(Boolean).join(" ")) ||
                    user.email ||
                    user.id;
                setSession({
                    user: {
                        id: user.id,
                        email: user.email || "",
                        name: fullName,
                        first_name: user.user_metadata?.first_name,
                        last_name: user.user_metadata?.last_name,
                    },
                    accessToken: newSession.access_token,
                });
            } else {
                setSession(null);
            }
        });

        return () => {
            alive = false;
            subscription.subscription.unsubscribe();
        };
    }, []);

    const user = session?.user || null; // Extract user for convenience

    return { session, user, loading }; // Include user in the returned object
}
