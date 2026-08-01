import { Head } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { PlaceholderPattern } from '@/components/ui/placeholder-pattern';
import { dashboard } from '@/routes';
import { useForm } from '@inertiajs/react';

export default function Dashboard() {
    const form = useForm({title: '', year: '', description:'' , category:'', author:''});

    function submit(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault();
        form.post('/projects', {
            onSuccess: () => form.reset(),
        });
    }
    return (
        <>
            <Head title="Dashboard" />
            <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">
                <div>
                    <h1 className='text-x1 font-semibold'>Projects</h1>
                    <p className='text-sm text-muted-foreground'>Add New Projects
                    </p>
                    </div>

                    <form  onSubmit={submit} className='max-w-x1 space-y-4 rounded-x1 border p-4'>
                        <div className='space-y-2'>
                        <label htmlFor='name'>tittle</label>
                        <Input
                            id='title'
                            value={form.data.title}
                            onChange={(event) => form.setData('title', event.target.value)}
                            />
                            {form.errors.title && <p className='text-sm text-red-600'>{form.errors.title}</p>}
                        </div>


                        <div className='space-y-2'>
                        <label htmlFor='description'>Description</label>
                        <Input
                            id='description'
                            value={form.data.description}
                            onChange={(event) => form.setData('description', event.target.value)}
                            />
                        </div>


                        <div className='space-y-2'>
                        <label htmlFor='year'>Year</label>
                        <Input
                            id='year'
                            value={form.data.year}
                            onChange={(event) => form.setData('year', event.target.value)}
                            />
                            {form.errors.year && <p className='text-sm text-red-600'>{form.errors.year}</p>}
                        </div>



                        <div className='space-y-2'>
                        <label htmlFor='category'>Category</label>
                        <Input
                            id='category'
                            value={form.data.category}
                            onChange={(event) => form.setData('category', event.target.value)}
                            />
                             {form.errors.category && <p className='text-sm text-red-600'>{form.errors.category}</p>}
                        </div>


                        <div className='space-y-2'>
                        <label htmlFor='author'>Author</label>
                        <Input
                            id='author'
                            value={form.data.author}
                            onChange={(event) => form.setData('author', event.target.value)}
                            />
                             {form.errors.author && <p className='text-sm text-red-600'>{form.errors.author}</p>}
                        </div>

                        <Button type='submit' disabled={form.processing}>
                            Save Product
                        </Button>
                        </form>
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
