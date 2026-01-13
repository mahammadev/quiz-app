import { createClient } from '@/lib/supabase/client'
import { RealtimeChannel } from '@supabase/supabase-js'
import { useState, useEffect } from 'react'

export type SessionStudent = {
    id: string
    fullName: string
    status: 'active' | 'inactive' // for presence
    joinedAt: Date
}

export function useSessionStudents(sessionId: string) {
    const [students, setStudents] = useState<SessionStudent[]>([])
    const supabase = createClient()

    useEffect(() => {
        if (!sessionId) return

        // Load initial attempts (joined students)
        const fetchStudents = async () => {
            const { data } = await supabase
                .from('exam_attempts')
                .select(`
            student_id, 
            created_at,
            profiles:student_id ( full_name )
         `)
                .eq('session_id', sessionId)

            if (data) {
                const mapped = data.map((d: any) => ({
                    id: d.student_id,
                    fullName: d.profiles?.full_name || 'Unknown Student',
                    status: 'inactive', // Default to inactive until presence confirms
                    joinedAt: new Date(d.created_at)
                }))
                setStudents(mapped as SessionStudent[])
            }
        }

        fetchStudents()

        // Subscribe to new attempts (new joins)
        const channel = supabase
            .channel(`session_lobby:${sessionId}`)
            .on('postgres_changes', {
                event: 'INSERT',
                schema: 'public',
                table: 'exam_attempts',
                filter: `session_id=eq.${sessionId}`
            }, async (payload) => {
                // Fetch profile for new student
                const { data } = await supabase
                    .from('profiles')
                    .select('full_name')
                    .eq('id', payload.new.student_id)
                    .single()

                const newStudent: SessionStudent = {
                    id: payload.new.student_id,
                    fullName: data?.full_name || 'Unknown',
                    status: 'active', // Just joined
                    joinedAt: new Date(payload.new.created_at)
                }

                setStudents(prev => [...prev, newStudent])
            })
            .subscribe()

        return () => {
            supabase.removeChannel(channel)
        }
    }, [sessionId])

    return students
}
