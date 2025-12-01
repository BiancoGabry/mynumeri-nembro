import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Settings } from 'lucide-react';

export function GeneralSettingsCard() {
    return (
        <Card>
            <CardHeader>
                <div className="flex items-center gap-2 select-none">
                    <Settings className="h-5 w-5 text-amber-600" />
                    <CardTitle>Generali</CardTitle>
                </div>
                <CardDescription className='select-none'>
                    Configura le impostazioni generali dell'interfaccia cassa
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                        <Label>Inserisci il nome della festa da visualizzare nel display</Label>
                        <div className="text-sm text-muted-foreground select-none">
                            Inserisci il nome della festa da visualizzare nel display
                        </div>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
