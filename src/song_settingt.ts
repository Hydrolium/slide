import JSZip from "jszip"

export interface ImageInfo {
  readonly file: File
  url: string
}

export interface SongFrame {
  readonly title: string
  readonly background: string
  readonly titleColor: string
  readonly titleStroke: string
  readonly titleShadow: string
  readonly textColor: string
  readonly textStroke: string
  readonly textShadow: string
}

export interface SongContext extends SongFrame {
  readonly text: string
}

export interface SongInfo extends SongFrame {
  readonly texts: string[]
}

export interface SongData extends SongInfo {
    readonly id: number
}

export interface ModifiedSongData extends SongContext {
    readonly textIdx: number
    readonly id: number
}

class SongSetting {

    private _jsonFiles: Record<string, SongData[]> = {} // 파일 이름: 곡 정보 리스트
    private _jsonFileOrder: string[] = [] // 파일 이름 리스트(순서)

    private _songs: Record<number, SongInfo> = {} // 노래 ID: 정보
    private _order: number[] = [] // 노래 ID 리스트(순서)
    private _currentSongId: number = -1 // 현재 노래 ID
    private _currentTextIndex: number = 0 // 현재 노래 가사 인덱스

    private _lastID = 0

    private _imgUrls: Record<string, ImageInfo> = {}

    get nextId(): number {
        return this._lastID++
    }

    get jsonFiles(): Record<string, SongData[]> {
        return this._jsonFiles
    }

    get jsonFileOrder(): string[] {
        return this._jsonFileOrder
    }

    get songs(): Record<number, SongInfo> {
        return this._songs
    }

    get order(): number[] {
        return this._order
    }

    get currentSongId(): number {
        
        if(!this._songs[this._currentSongId]) {
            if(this.isEmpty()) this._currentSongId = -1
            else this._currentSongId = Number(Object.keys(this._songs)[0])
        }
        if(this.isEmpty()) this._currentSongId = -1        

        return this._currentSongId
        
    }

    get currentSongOrder(): number {
        if(this.isEmpty()) return 0;
        return this._order.indexOf(this._currentSongId)
    }

    get currentTextIndex(): number {

        if(!this._songs[this.currentSongId]?.texts) this._currentTextIndex = 0

        return this._currentTextIndex
    }

    get imgUrls(): Record<string, ImageInfo> {
        return this._imgUrls
    }

    get currentSong(): SongInfo {
        return this._songs[this._currentSongId]
    }

    get currentContext(): SongContext {

        const song = this._songs[this.currentSongId]

        return {
            ...song,
            text: song.texts[this.currentTextIndex],
            background: song.background
        }
    }

    get defaultSongInfo(): SongInfo {
        return {title: "제목을 입력하세요", texts: ["가사를 입력하세요"], background: "", titleColor: "#fff", titleStroke: "#000", titleShadow: "#0000", textColor: "#fff", textStroke: "#000", textShadow: "#0000"}
    }

    public getSongWithId(id: number): SongInfo {
        const song = this._songs[id]
        return {
            ...song,
            background: song.background
        }
    }

    public resetSetting() {
        this._songs = {}
        this._order = []
        this._currentSongId = -1
        this._currentTextIndex = -1
    }

    public isEmpty() {
        return this._order.length === 0
    }

    public previous(): SongContext | null {
        if(this.isEmpty()) return null
        
        this._currentTextIndex--;

        if(this.currentTextIndex < 0 ) {
            const songIdx = this.order.indexOf(this.currentSongId) - 1

            if(songIdx < 0) {
                this._currentTextIndex = 0
                return null
            }

            const songTitle = this.order[songIdx]

            this._currentSongId = songTitle
            this._currentTextIndex = songSetting.songs[songTitle].texts.length - 1
        }

        return this.currentContext
    }

    public next(): SongContext | null {

        if(this.isEmpty()) return null
        
        const song = this._songs[this._currentSongId]

        this._currentTextIndex++;

        if(this._currentTextIndex >= song.texts.length) {
            const songIdx = this._order.indexOf(this._currentSongId) + 1

            if(songIdx >= this._order.length) {
                this._currentTextIndex = song.texts.length -1
                return null
            }

            this._currentSongId = this.order[songIdx]
            this._currentTextIndex = 0
        }


        return this.currentContext
    }
    
    public goto(id: number, textIdx: number) {
        this._currentSongId = id
        this._currentTextIndex = textIdx
    }

    public resortOrder (ids: number[]) {
    
        const nts = new Set(ids)

        songSetting.order.forEach(t => {
            if(!nts.has(t)) {
                delete songSetting.songs[t]
            }
        })

        songSetting._order = [...ids]

    }

    public async loadFiles(files: File[]) {
        
        if (!files || files.length === 0) return
            

        for(const file of files) {
            if(file.type.includes('json')) {

                const parsed = JSON.parse(await file.text())

                if(Array.isArray(parsed)) this.loadJson(file.name, parsed)
                else this.loadJson(file.name, [parsed])

            }
            else if (file.type.startsWith('image/')) this.loadImage(file)
        }

        this.load()

    }

    private loadImage(file: File) {
        if(file.name in this._imgUrls) URL.revokeObjectURL(this._imgUrls[file.name].url)

        this._imgUrls[file.name] = {file: file, url: URL.createObjectURL(file)}
    }

    private loadJson(fileName: string, data: SongInfo[]) {

        if(!this._jsonFiles[fileName]) this._jsonFileOrder.push(fileName)
        
        this._jsonFiles[fileName] = data.map(j => {return {...j, id: this.nextId}})
    }

    private addSong(song: SongData) {
        if(!this._songs[song.id]) this._order.push(song.id)
        this._songs[song.id] = song
    }

    private getImgName(url: string): string {
        for(const [name, info] of Object.entries(this._imgUrls)) 
            if(info.url === url) return name

       return ""
    }

    public insertNewSongAt(index: number, select: boolean = true) {
        const id = this.nextId

        this._order = this._order.toSpliced(index, 0, id)
        this._songs[id] = {...this.defaultSongInfo}

        if(select){
            this._currentSongId = id
            this._currentTextIndex = 0
        }
    }

    public insertNewTextAt(index: number, select: boolean = true) {
        if(this.isEmpty()) return

        const song = this.currentSong

        this._songs[this._currentSongId] = {...song, texts: song.texts.toSpliced(index, 0, "가사를 입력하세요")}

        if(select) this._currentTextIndex = index
    }

    public modifySong(modified: ModifiedSongData) { // background 속성은 url로 들어와서 name으로 변환 필요
        const original = this._songs[modified.id]
        if(!original) return

        original.texts[modified.textIdx] = modified.text


        this._songs[modified.id] = {...original, ...modified, background: this.getImgName(modified.background)}

    }

    public manageFile(jsonFiles: string[], imgFiles: string[]) {

        const jsonSet = new Set(jsonFiles)
        const imgSet = new Set(imgFiles)

        Object.keys(this._jsonFiles).forEach(name => {
            if(!jsonSet.has(name)) {
                delete this._jsonFiles[name]
            }
        })
        
        this._jsonFileOrder = this._jsonFileOrder.filter(n => jsonSet.has(n))

        Object.keys(this._imgUrls).forEach(name => {
            if(!imgSet.has(name)) {
                URL.revokeObjectURL(this._imgUrls[name].url)
                delete this._imgUrls[name]
            }
        })
        
        this.load()
    }

    public load() {
        this._songs = {}
        this._order = []

        this._jsonFileOrder.forEach(fileName => {
            const songList = this._jsonFiles[fileName]
            songList.forEach(song => this.addSong(song))
        })
    }

    public async getExportLink() {
        const exportList: SongInfo[] = []
        const usedImgs = new Set<string>()
        
        this._order.forEach(id => {
            const song = this._songs[id]
            
            exportList.push({ // id가 남아있는 경우도 있어서 이렇게 해야함
                title: song.title,
                texts: song.texts,
                background: song.background,
                titleColor: song.titleColor,
                titleStroke: song.titleStroke,
                titleShadow: song.titleShadow,
                textColor: song.textColor,
                textStroke: song.textStroke,
                textShadow: song.textShadow
            })
            usedImgs.add(song.background)
        })
    
        const zip = new JSZip()
    
        const jsonString = JSON.stringify(exportList, null, 2)
        zip.file('data.json', jsonString)
        
        Object.entries(this._imgUrls).forEach(([name, {file}]) => {
            if(usedImgs.has(name)) zip.file(name, file)
        })
    
        const zipBlob = await zip.generateAsync({type: 'blob'})
        return URL.createObjectURL(zipBlob)
    }
}

export const songSetting = new SongSetting()
