'use client';

import React, { useState, useEffect } from 'react';
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { 
  ShieldAlert, 
  Building2, 
  Plus, 
  Users, 
  Globe, 
  Mail, 
  Calendar,
  ChevronRight,
  Loader2,
  AlertTriangle
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { toast } from "@/components/ui/base-toaster";

import { useRouter } from 'next/navigation';

export default function PlatformOwnerPage() {
  const isOwner = useQuery(api.platform.isPlatformOwner);
  const claimOwnership = useMutation(api.platform.claimPlatformOwnership);
  // Only query organizations if we are confirmed as the owner
  const orgs = useQuery(api.platform.listAllOrganizations, isOwner ? {} : "skip");
  const createOrg = useMutation(api.platform.createOrganization);
  const router = useRouter();

  const [isAddOpen, setIsAddOpen] = useState(false);
  const [newOrgName, setNewOrgName] = useState('');
  const [newOrgSlug, setNewOrgSlug] = useState('');
  const [ownerEmail, setOwnerEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isClaiming, setIsClaiming] = useState(false);
  const [mainAppUrl, setMainAppUrl] = useState('');
  const [isEditingUrl, setIsEditingUrl] = useState(false);
  const [currentPort, setCurrentPort] = useState('');

  useEffect(() => {
    // Determine the main app URL based on current origin
    if (typeof window !== 'undefined') {
      const { protocol, hostname, port } = window.location;
      setCurrentPort(port || '80');
      
      const savedUrl = localStorage.getItem('admin_main_app_url');
      if (savedUrl) {
        setMainAppUrl(savedUrl);
        return;
      }

      // Default heuristic: 
      // If Admin is on 3001, Main is likely on 3000
      // If Admin is on 3000, Main might be on 3001
      if (port === '3001') {
        setMainAppUrl(`${protocol}//${hostname}:3000`);
      } else if (port === '3000') {
        setMainAppUrl(`${protocol}//${hostname}:3001`);
      } else {
        setMainAppUrl(`${protocol}//${hostname}:3000`);
      }
    }
  }, []);

  const saveUrl = (url: string) => {
    setMainAppUrl(url);
    localStorage.setItem('admin_main_app_url', url);
    setIsEditingUrl(false);
    toast.success("Main App URL updated");
  };

  const handleClaim = async () => {
    setIsClaiming(true);
    try {
      await claimOwnership();
      toast.success("You are now the Platform Owner!");
    } catch (err: any) {
      toast.error(err.message || "Failed to claim ownership");
    } finally {
      setIsClaiming(false);
    }
  };

  const handleCreate = async () => {
    if (!newOrgName || !newOrgSlug || !ownerEmail) {
        toast.error("Please fill all fields");
        return;
    }
    setIsSubmitting(true);
    try {
      await createOrg({
        name: newOrgName.trim(),
        slug: newOrgSlug.toLowerCase().trim().replace(/\s+/g, '-'),
        ownerEmail: ownerEmail.trim()
      });
      toast.success("Organization created successfully");
      setIsAddOpen(false);
      setNewOrgName('');
      setNewOrgSlug('');
      setOwnerEmail('');
    } catch (err: any) {
      toast.error(err.message || "Failed to create organization");
    } finally {
      setIsSubmitting(false);
    }
  };

  const getUrl = (path: string) => {
    return mainAppUrl ? `${mainAppUrl}${path}` : path;
  };

  if (isOwner === undefined) return <div className="flex h-screen items-center justify-center"><Loader2 className="animate-spin" /></div>;

  if (isOwner === false) {
    return (
      <div className="flex flex-col h-screen items-center justify-center space-y-6 text-center px-4">
        <div className="max-w-md space-y-4">
          <ShieldAlert className="w-16 h-16 text-destructive mx-auto" />
          <h1 className="text-3xl font-bold font-display">Access Denied</h1>
          <p className="text-muted-foreground text-lg">
            You are not authorized to view the Platform Administration. 
            Only the Platform Owner can manage organizations.
          </p>
          <div className="pt-6 space-y-3">
            <Button 
              size="lg" 
              className="w-full font-bold" 
              onClick={handleClaim}
              disabled={isClaiming}
            >
              {isClaiming ? <Loader2 className="animate-spin mr-2" /> : <Plus className="mr-2" />}
              Claim Platform Ownership
            </Button>
            <Button 
              variant="ghost" 
              className="w-full" 
              asChild
            >
              <a href={getUrl('/')}>Go Back Home</a>
            </Button>
          </div>
          <div className="pt-8 border-t border-dashed">
             <p className="text-xs text-muted-foreground mb-2">Main App URL Configuration:</p>
             <div className="flex gap-2 justify-center">
                <Input 
                  className="h-8 w-48 text-xs" 
                  value={mainAppUrl} 
                  onChange={(e) => setMainAppUrl(e.target.value)}
                />
                <Button size="sm" className="h-8 px-2" onClick={() => saveUrl(mainAppUrl)}>Save</Button>
             </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-muted/20 p-8">
      <div className="max-w-6xl mx-auto space-y-8">
        <header className="flex justify-between items-end">
          <div>
            <div className="flex items-center gap-2 text-primary font-bold mb-1 tracking-tight">
              <ShieldAlert className="w-5 h-5" />
              Platform Administration
            </div>
            <h1 className="text-4xl font-extrabold tracking-tight font-display">Organization Control</h1>
            <p className="text-muted-foreground mt-1">Manage every organization and their high-level configurations.</p>
          </div>

          <div className="flex items-center gap-3">
             <div className="flex flex-col items-end mr-4">
                {isEditingUrl ? (
                  <div className="flex gap-2">
                    <Input 
                      className="h-8 w-48 text-xs" 
                      value={mainAppUrl} 
                      onChange={(e) => setMainAppUrl(e.target.value)}
                    />
                    <Button size="sm" className="h-8 px-2" onClick={() => saveUrl(mainAppUrl)}>Save</Button>
                  </div>
                ) : (
                  <div className="flex flex-col items-end">
                    <button 
                      onClick={() => setIsEditingUrl(true)}
                      className="text-[10px] text-muted-foreground hover:text-primary underline"
                    >
                      Target: {mainAppUrl || 'Same Origin'}
                    </button>
                    {mainAppUrl.includes(`:${currentPort}`) && (
                      <span className="text-[10px] text-destructive font-bold">Warning: Target matches current port!</span>
                    )}
                  </div>
                )}
             </div>
             <Button 
               variant="outline" 
               asChild
             >
               <a href={getUrl('/dashboard')}>Main Dashboard</a>
             </Button>
             <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
               <DialogTrigger asChild>
                 <Button size="lg" className="shadow-lg">
                   <Plus className="w-4 h-4 mr-2" />
                   Add Organization
                 </Button>
               </DialogTrigger>
               <DialogContent>
                 <DialogHeader>
                   <DialogTitle>Register New Organization</DialogTitle>
                   <DialogDescription>
                     Manually register an organization and assign an owner.
                   </DialogDescription>
                 </DialogHeader>
                 <div className="space-y-4 py-4">
                   <div className="space-y-2">
                     <Label htmlFor="org-name">Organization Name</Label>
                     <Input id="org-name" placeholder="e.g. Baku State University" value={newOrgName} onChange={e => setNewOrgName(e.target.value)} />
                   </div>
                   <div className="space-y-2">
                     <Label htmlFor="org-slug">URL Slug</Label>
                     <Input id="org-slug" placeholder="e.g. bsu" value={newOrgSlug} onChange={e => setNewOrgSlug(e.target.value)} />
                   </div>
                   <div className="space-y-2">
                     <Label htmlFor="owner-email">Initial Owner Email</Label>
                     <div className="flex gap-2">
                       <Input id="owner-email" type="email" placeholder="owner@bsu.edu.az" value={ownerEmail} onChange={e => setOwnerEmail(e.target.value)} />
                     </div>
                     <p className="text-[10px] text-muted-foreground flex items-center gap-1">
                       <AlertTriangle className="w-3 h-3 text-amber-500" />
                       The user must have signed into the app at least once.
                     </p>
                   </div>
                 </div>
                 <DialogFooter>
                   <Button variant="ghost" onClick={() => setIsAddOpen(false)}>Cancel</Button>
                   <Button onClick={handleCreate} disabled={isSubmitting}>
                     {isSubmitting && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                     Register Organization
                   </Button>
                 </DialogFooter>
               </DialogContent>
             </Dialog>
          </div>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Total Organizations</CardDescription>
              <CardTitle className="text-3xl font-bold">{orgs?.length || 0}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center text-xs text-green-600 font-medium">
                <Globe className="w-3 h-3 mr-1" />
                Active across all domains
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Local Status</CardDescription>
              <CardTitle className="text-3xl font-bold">Port {currentPort}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center text-xs text-blue-600 font-medium">
                <AlertTriangle className="w-3 h-3 mr-1" />
                Admin Portal Origin
              </div>
            </CardContent>
          </Card>
          <Card className="border-dashed">
            <CardHeader className="pb-2">
              <CardDescription>Target Main App</CardDescription>
              <CardTitle className="text-sm font-mono truncate">{mainAppUrl}</CardTitle>
            </CardHeader>
            <CardContent>
              <button onClick={() => setIsEditingUrl(true)} className="text-xs text-primary underline">Change Target</button>
            </CardContent>
          </Card>
        </div>

        <div className="mt-8 p-6 rounded-2xl border border-dashed border-border bg-muted/10">
          <h2 className="text-lg font-bold mb-4">Diagnostic Info</h2>
          <div className="space-y-2 text-sm">
            <p>1. Ensure your main application is running in another terminal (root directory: <code>bun run dev</code>).</p>
            <p>2. If the main app is on a different port than <code>3000</code>, update the <b>Target</b> URL at the top right.</p>
            <p>3. Visiting an organization will try to open: <b>{mainAppUrl}/org/[slug]</b></p>
            <p>4. If you see a 404, verify that the terminal running the main app shows the <code>/org/[slug]</code> route in its compile list.</p>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Platform Organizations</CardTitle>
            <CardDescription>A complete list of registered entities on your platform.</CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            <ScrollArea className="h-[500px]">
              <div className="divide-y">
                {orgs === undefined ? (
                  <div className="p-12 text-center text-muted-foreground">Loading organizations...</div>
                ) : orgs.length === 0 ? (
                  <div className="p-12 text-center text-muted-foreground">No organizations registered yet.</div>
                ) : (
                  orgs.map((org: any) => (
                    <div key={org._id} className="p-6 hover:bg-muted/30 transition-colors flex items-center justify-between group">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center font-bold text-xl border border-primary/20">
                          {org.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className="font-bold text-lg text-foreground leading-none">{org.name}</h3>
                            <Badge variant="secondary" className="text-[10px] py-0">{org.slug}</Badge>
                          </div>
                          <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                            <span className="flex items-center gap-1">
                              <Mail className="w-3 h-3" />
                              {org.ownerEmail}
                            </span>
                            <span className="flex items-center gap-1">
                              <Calendar className="w-3 h-3" />
                              {new Date(org.createdAt).toLocaleDateString()}
                            </span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2">
                         <div className="text-right mr-4 opacity-0 group-hover:opacity-100 transition-opacity">
                            <p className="text-xs font-medium text-foreground">Owner: {org.ownerName}</p>
                            <p className="text-[10px] text-muted-foreground">Plan: {org.planId}</p>
                         </div>
                         <Button variant="outline" size="sm" asChild>
                            <a href={getUrl(`/org/${org.slug}`)}>
                              Visit
                              <ChevronRight className="w-4 h-4 ml-1" />
                            </a>
                         </Button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
