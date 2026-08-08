import { Head } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { dashboard } from '@/routes';
import { firestore, ensureFirebaseAuth } from '@/lib/firebase';
import {
    addDoc,
    collection,
    deleteDoc,
    doc,
    getDocs,
    orderBy,
    query,
    serverTimestamp,
    Timestamp,
} from 'firebase/firestore';
import { useEffect, useMemo, useState } from 'react';

interface ScheduleEntry {
    id: string;
    title: string;
    date: string;
    time: string;
    location: string;
    notes: string;
    createdAt?: Timestamp | null;
}

function formatDate(value: string | undefined | null) {
    return value || '—';
}

function formatTimestamp(value?: Timestamp | null) {
    if (!value) {
        return 'Just now';
    }

    return value.toDate().toLocaleString();
}

export default function Dashboard() {
    const [form, setForm] = useState({
        title: '',
        date: '',
        time: '',
        location: '',
        notes: '',
    });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [statusMessage, setStatusMessage] = useState('');
    const [errorMessage, setErrorMessage] = useState('');
    const [schedules, setSchedules] = useState<ScheduleEntry[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    const totalSchedules = useMemo(() => schedules.length, [schedules]);

    async function loadSchedules() {
        setIsLoading(true);
        setErrorMessage('');

        try {
            await ensureFirebaseAuth();

            const schedulesQuery = query(
                collection(firestore, 'schedules'),
                orderBy('createdAt', 'desc')
            );
            const snapshot = await getDocs(schedulesQuery);
            const entries = snapshot.docs.map((item) => ({
                id: item.id,
                ...(item.data() as Omit<ScheduleEntry, 'id'>),
            }));
            setSchedules(entries);
        } catch (error) {
            console.error('Firestore load failed:', error);
            setErrorMessage('Unable to load saved schedules.');
        } finally {
            setIsLoading(false);
        }
    }

    async function submit(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault();
        setStatusMessage('');
        setErrorMessage('');
        setIsSubmitting(true);

        try {
            await ensureFirebaseAuth();

            await addDoc(collection(firestore, 'schedules'), {
                title: form.title,
                date: form.date,
                time: form.time,
                location: form.location,
                notes: form.notes,
                createdAt: serverTimestamp(),
            });

            setStatusMessage('Schedule saved to Firestore successfully.');
            setForm({ title: '', date: '', time: '', location: '', notes: '' });
            await loadSchedules();
        } catch (error) {
            console.error('Firestore submit failed:', error);
            const message = error instanceof Error
                ? error.message
                : String(error || 'Unknown error');
            setErrorMessage(`Unable to save schedule to Firestore: ${message}`);
        } finally {
            setIsSubmitting(false);
        }
    }

    async function removeSchedule(id: string) {
        setErrorMessage('');
        setStatusMessage('');

        try {
            await deleteDoc(doc(firestore, 'schedules', id));
            setSchedules((current) => current.filter((item) => item.id !== id));
            setStatusMessage('Schedule removed successfully.');
        } catch (error) {
            console.error('Firestore delete failed:', error);
            setErrorMessage('Unable to remove schedule.');
        }
    }

    useEffect(() => {
        loadSchedules();
    }, []);

    return (
        <>
            <Head title="Dashboard" />
            <div className="flex h-full flex-1 flex-col gap-6 overflow-x-auto rounded-xl p-4">
                <div className="flex flex-col gap-3">
                    <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                        <div>
                            <h1 className="text-xl font-semibold">Dashboard</h1>
                            <p className="text-sm text-muted-foreground">
                                Manage schedules saved directly to Firestore.
                            </p>
                        </div>
                        <div className="rounded-full bg-muted px-4 py-2 text-sm text-muted-foreground shadow-sm">
                            {totalSchedules} schedules saved
                        </div>
                    </div>
                </div>

                <div className="grid gap-6 xl:grid-cols-[1.4fr_0.9fr]">
                    <Card className="rounded-3xl border border-border bg-background shadow-sm">
                        <CardHeader>
                            <CardTitle className="text-lg">Create schedule</CardTitle>
                            <CardDescription>
                                Enter details and save them to your Firestore schedule collection.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6 pt-4">
                            {statusMessage && (
                                <div className="rounded-2xl bg-emerald-950/40 p-4 text-sm text-emerald-300">
                                    {statusMessage}
                                </div>
                            )}
                            {errorMessage && (
                                <div className="rounded-2xl bg-red-950/40 p-4 text-sm text-red-300">
                                    {errorMessage}
                                </div>
                            )}

                            <form onSubmit={submit} className="space-y-5">
                                <div className="grid gap-4 lg:grid-cols-2">
                                    <div className="space-y-2">
                                        <label htmlFor="title" className="block text-sm font-medium">
                                            Title
                                        </label>
                                        <Input
                                            id="title"
                                            value={form.title}
                                            onChange={(event) => setForm((current) => ({ ...current, title: event.target.value }))}
                                            required
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <label htmlFor="location" className="block text-sm font-medium">
                                            Location
                                        </label>
                                        <Input
                                            id="location"
                                            value={form.location}
                                            onChange={(event) => setForm((current) => ({ ...current, location: event.target.value }))}
                                        />
                                    </div>
                                </div>

                                <div className="grid gap-4 md:grid-cols-2">
                                    <div className="space-y-2">
                                        <label htmlFor="date" className="block text-sm font-medium">
                                            Date
                                        </label>
                                        <Input
                                            id="date"
                                            type="date"
                                            value={form.date}
                                            onChange={(event) => setForm((current) => ({ ...current, date: event.target.value }))}
                                            required
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label htmlFor="time" className="block text-sm font-medium">
                                            Time
                                        </label>
                                        <Input
                                            id="time"
                                            type="time"
                                            value={form.time}
                                            onChange={(event) => setForm((current) => ({ ...current, time: event.target.value }))}
                                            required
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label htmlFor="notes" className="block text-sm font-medium">
                                        Notes
                                    </label>
                                    <textarea
                                        id="notes"
                                        className="min-h-[120px] w-full rounded-2xl border border-input bg-transparent px-4 py-3 text-sm shadow-sm outline-none transition focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]"
                                        value={form.notes}
                                        onChange={(event) => setForm((current) => ({ ...current, notes: event.target.value }))}
                                    />
                                </div>

                                <div className="flex justify-end">
                                    <Button type="submit" disabled={isSubmitting}>
                                        {isSubmitting ? 'Saving...' : 'Save Schedule'}
                                    </Button>
                                </div>
                            </form>
                        </CardContent>
                    </Card>

                    <Card className="rounded-3xl border border-border bg-background shadow-sm">
                        <CardHeader>
                            <CardTitle className="text-lg">Saved schedules</CardTitle>
                            <CardDescription>
                                Review recent schedules, refresh the list, or delete entries.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4 pt-4">
                            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                                <p className="text-sm text-muted-foreground">
                                    {isLoading ? 'Loading schedules…' : `${totalSchedules} saved schedules`}
                                </p>
                                <Button variant="secondary" size="sm" type="button" onClick={loadSchedules}>
                                    Refresh
                                </Button>
                            </div>

                            {schedules.length === 0 && !isLoading ? (
                                <div className="rounded-2xl bg-muted p-4 text-sm text-muted-foreground">
                                    No saved schedules yet. Create one to see it here.
                                </div>
                            ) : (
                                schedules.map((schedule) => (
                                    <div key={schedule.id} className="rounded-3xl border border-border bg-muted p-4 shadow-sm">
                                        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                                            <div>
                                                <p className="text-base font-semibold">{schedule.title || 'Untitled'}</p>
                                                <p className="text-sm text-muted-foreground">
                                                    {formatDate(schedule.date)} · {formatDate(schedule.time)}
                                                </p>
                                            </div>
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                type="button"
                                                onClick={() => removeSchedule(schedule.id)}
                                            >
                                                Delete
                                            </Button>
                                        </div>

                                        <div className="mt-4 grid gap-3 sm:grid-cols-2">
                                            <div className="rounded-2xl bg-background p-3 text-sm">
                                                <p className="font-medium">Location</p>
                                                <p className="text-muted-foreground">{schedule.location || 'None'}</p>
                                            </div>
                                            <div className="rounded-2xl bg-background p-3 text-sm">
                                                <p className="font-medium">Created</p>
                                                <p className="text-muted-foreground">{formatTimestamp(schedule.createdAt)}</p>
                                            </div>
                                        </div>

                                        {schedule.notes ? (
                                            <div className="mt-4 rounded-2xl bg-background p-3 text-sm">
                                                <p className="font-medium">Notes</p>
                                                <p className="text-muted-foreground">{schedule.notes}</p>
                                            </div>
                                        ) : null}
                                    </div>
                                ))
                            )}
                        </CardContent>
                        <CardFooter className="justify-end pt-2">
                            <p className="text-xs text-muted-foreground">
                                Use Refresh to reload the latest saved schedules from Firestore.
                            </p>
                        </CardFooter>
                    </Card>
                </div>
            </div>
        </>
    );
}

Dashboard.layout = {
    breadcrumbs: [
        {
            title: 'Dashboard',
            href: dashboard(),
        },
    ],
};
