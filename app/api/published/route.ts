import { NextResponse } from 'next/server';
import { getPublishedContent } from '@/lib/published-content';

export async function GET(request:Request){const collection=new URL(request.url).searchParams.get('collection');if(collection&&collection!=='paper'&&collection!=='article')return NextResponse.json({message:'Invalid collection.'},{status:400});return NextResponse.json({items:await getPublishedContent(collection as 'paper'|'article'|undefined)});}
