'use client'

import {Popover, PopoverContent, PopoverTrigger} from "@/components/ui/popover";
import {Button} from "@/components/ui/button";
import {LiaBrushSolid} from "react-icons/lia";
import ColorPicker from "@/components/common/ColorPicker";
import {useRouter} from "next/navigation";

const TopBar = () => {

    const router = useRouter();

    const handleTheme = (color: string) => {
        document.documentElement.style.setProperty('--primary', color)
        localStorage.setItem('themeColor', color)
    }

    return (
        <div className="fixed top-0 left-0 right-0 p-1 border-b bg-white z-[1000]">
            <div className="flex justify-between items-center">
                <Popover>
                    <PopoverTrigger asChild>
                        <Button variant="outline"><LiaBrushSolid className="w-[19px] h-[19px] mr-1"/>Theme</Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-fit space-y-3">
                        <div>
                            <span className="text-[15px] font-medium leading-none">테마 변경</span>
                            <p className="text-sm text-muted-foreground">
                                원하는 테마 색상을 선택하세요.
                            </p>
                        </div>

                        <div>
                            <span className="text-[15px] font-medium leading-none">Color</span>
                            <div className="py-2 space-y-3">
                                <div className="flex justify-around">
                                    <ColorPicker handleTheme={handleTheme}/>
                                </div>
                            </div>
                        </div>
                    </PopoverContent>
                </Popover>

                <div className="flex items-center space-x-2">
                    <Button onClick={() => router.push("/admin")}>대시보드</Button>
                </div>
            </div>
        </div>
    )
}

export default TopBar;