import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { PlusCircle, Settings, Trash2 } from "lucide-react"

export function WebsiteBuilder() {
  return (
    <div className="flex flex-col h-full bg-muted/20">
      <header className="flex items-center justify-between p-4 border-b bg-background">
        <h1 className="text-xl font-bold">My Awesome Site</h1>
        <Button>Publish</Button>
      </header>
      
      <div className="flex-1 p-4 overflow-y-auto">
        <div className="grid gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Site Definition</CardTitle>
            </CardHeader>
            <CardContent className="grid md:grid-cols-2 gap-4">
              <Input placeholder="Site Name" defaultValue="My Awesome Site" />
              <Input placeholder="Site Description" defaultValue="A brief description of the site." />
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Pages</CardTitle>
              <Button variant="ghost" size="sm">
                <PlusCircle className="mr-2 h-4 w-4" /> Add Page
              </Button>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex items-center justify-between p-2 rounded-md hover:bg-muted">
                  <span>Home</span>
                  <div className="space-x-2">
                    <Button variant="ghost" size="icon"><Settings className="h-4 w-4" /></Button>
                    <Button variant="ghost" size="icon" className="text-destructive"><Trash2 className="h-4 w-4" /></Button>
                  </div>
                </div>
                <div className="flex items-center justify-between p-2 rounded-md bg-muted/60">
                  <span>About Us</span>
                   <div className="space-x-2">
                    <Button variant="ghost" size="icon"><Settings className="h-4 w-4" /></Button>
                    <Button variant="ghost" size="icon" className="text-destructive"><Trash2 className="h-4 w-4" /></Button>
                  </div>
                </div>
                <div className="flex items-center justify-between p-2 rounded-md hover:bg-muted">
                  <span>Contact</span>
                   <div className="space-x-2">
                    <Button variant="ghost" size="icon"><Settings className="h-4 w-4" /></Button>
                    <Button variant="ghost" size="icon" className="text-destructive"><Trash2 className="h-4 w-4" /></Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="grid lg:grid-cols-3 gap-6">
            <main className="lg:col-span-2">
              <Card className="h-[400px]">
                <CardHeader>
                  <CardTitle>Canvas</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-center h-full border-2 border-dashed rounded-md">
                    <span>Drop components here</span>
                  </div>
                </CardContent>
              </Card>
            </main>

            <aside>
              <Card>
                <CardHeader>
                  <CardTitle>Controls</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">Component settings will appear here.</p>
                </CardContent>
              </Card>
            </aside>
          </div>
        </div>
      </div>
    </div>
  )
}
