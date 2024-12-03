// pages/[category]/index.js
import fs from 'fs';
import path from 'path';
import Link from 'next/link';
const defaultCategoryName = '默认目录';

export async function getStaticPaths() {
    const categoryDir = path.join(process.cwd(), 'posts');
    const categories = fs.readdirSync(categoryDir);
    const categoryDirList = [];
    const defaultPosts = [];

    categories.forEach(item => {
        item.endsWith('.md') ? defaultPosts.push(item) : categoryDirList.push(item)
    })
    const paths = categoryDirList.map((category) => ({
        params: { category },
    }));
    if (defaultPosts.length) {
        paths.push({ params: { category: defaultCategoryName, posts: defaultPosts } })
    }
    return {
        paths,
        fallback: false,
    };
}

export async function getStaticProps({ params }) {
    const category = params.category;
    const posts = category == defaultCategoryName ? params.posts : fs.readdirSync(path.join('posts', category));
    return {
        props: {
            category,
            posts,
        },
    };
}

export default function CategoryPage({ category, posts }) {
    return (
        <div>
            <h1>{category}</h1>
            <ul>
                {posts.map((post) => (
                    <li key={post}>
                        <Link href={category == defaultCategoryName ? `/${post}` : `/${category}/${post}`}>
                            <a>{post}</a>
                        </Link>
                    </li>
                ))}
            </ul>
        </div>
    );
}
