import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { guard } from "@/lib/auth";
import { handle } from "@/lib/api";
export const dynamic = "force-dynamic";
export const GET = handle(async () => {
 const denied = await guard(); if (denied) return denied;
 const reviews = await prisma.productReview.findMany({where:{approved:false},include:{user:{select:{name:true,email:true}},product:{select:{name:true}}},orderBy:{createdAt:"desc"},take:100});
 return NextResponse.json(reviews);
});
