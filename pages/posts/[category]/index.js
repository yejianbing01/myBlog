// pages/[category]/index.js
import fs from 'fs';
import path from 'path';
import Link from 'next/link';
import Layout from '../../../components/layout';


export async function getStaticPaths() {
    const categoryDir = path.join(process.cwd(), 'posts');
    const categoryNames = fs.readdirSync(categoryDir);
    return {
        paths: categoryNames.map((category) => ({
            params: { category },
        })),
        fallback: false,
    };
}

export async function getStaticProps({ params }) {
    const category = params.category;
    const posts = fs.readdirSync(path.join('posts', category));
    return {
        props: {
            category,
            posts,
        },
    };
}

export default function CategoryPage({ category, posts }) {
    return (
        <Layout>
            <h1>{category}</h1>
            <ul>
                {posts.map((post) => (
                    <li key={post}>
                        <Link href={`/posts/${category}/${post}`}>{post}</Link>
                    </li>
                ))}
            </ul>
        </Layout>
    );
}
