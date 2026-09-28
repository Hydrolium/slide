import JSZip from "jszip"

export interface ImageInfo {
    readonly file: File
    readonly url: string
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

export interface TitltedText {
    readonly title: string
    readonly text: string
}

export interface SongInfo extends SongFrame {
    readonly texts: readonly TitltedText[]
}

export interface SongInfoOnJSON extends SongFrame {
    readonly texts: readonly (string | TitltedText)[]
}

const convertJSONtoSongInfo = (songInfoOnJson: SongInfoOnJSON) => {
    return {
        ...songInfoOnJson,
        texts: songInfoOnJson.texts.map(
                v => {
                    if(typeof v === 'string') return {title: songInfoOnJson.title, text: v}
                    return {...v}
                }
        )} as SongInfo
}

export interface SongContext extends SongInfo {
    readonly textIdx: number
}

export interface SongData extends SongInfo {
    readonly id: number
}

export interface ModifiedSongData extends SongContext {
    readonly textIdx: number
    readonly id: number
}

export type FileDeletingOption = 'ONLY_FILE' | 'CASCADE'

export interface ManagementResult {
    readonly removedImgs: Set<string> // 삭제된 이미지 이름 set
    readonly removedJsons: Record<string, FileDeletingOption> // key: 삭제된 json 파일 이름, value: 삭제 옵션
    readonly refreshedJsons: Set<string> // 새로고침된 json 파일 이름 set
}

export class SongSetting {

    private _jsonFiles: Record<string, SongData[]> = {} // 파일 이름: 곡 정보 리스트

    private _songs: Record<number, SongInfo> = {} // 노래 ID: 정보
    private _order: number[] = [] // 노래 ID 리스트(순서)
    private _currentSongId: number | null = null // 현재 노래 ID
    private _currentTextIdx: number | null = null // 현재 노래 가사 인덱스

    private _lastID = 0

    private _imgUrls: Record<string, ImageInfo> = {}

    private get nextId(): number {
        return this._lastID++
    }

    get jsonFiles(): Readonly<Record<string, readonly SongData[]>> {
        return this._jsonFiles
    }

    get songs(): Readonly<Record<number, SongInfo>> {
        return this._songs
    }

    get order(): readonly number[] {
        return this._order
    }

    get currentSongId(): number | null {
        return this._currentSongId
    }

    get imgUrls(): Readonly<Record<string, ImageInfo>> {
        return this._imgUrls
    }

    private get currentSong(): SongInfo | null {
        return (this._currentSongId === null) ? null : (this._songs[this._currentSongId] ?? null)
    }

    get currentTextIdx(): number | null {
        return this._currentTextIdx
    }

    get currentContext(): SongContext | null {

        const song = this.currentSong

        if(song && this.currentTextIdx !== null)
            return {
                ...song,
                textIdx: this.currentTextIdx,
                background: song.background
            }

        return null
    }

    private get _defaultSongInfo(): SongInfo {
        return {
            title: "제목을 입력하세요",
            texts: [{"title": "제목을 입력하세요", "text": "가사를 입력하세요"}],
            background: "",
            titleColor: "#fff",
            titleStroke: "#000",
            titleShadow: "#0000",
            textColor: "#fff",
            textStroke: "#000",
            textShadow: "#0000"}
    }

    public getSongWithId(id: number): SongInfo | null {
        const song = this._songs[id]
        if(!song) return null
        return {
            ...song,
            background: song.background
        }
    }

    public isEmpty(): boolean {
        return this._order.length === 0
    }

    public normalize() {
        if(this.isEmpty()) {
            this._currentSongId = null
            this._currentTextIdx = null
            return
        }
        if(this.currentSong === null) this._currentSongId = this._order[0]
        if(this._currentTextIdx === null) this._currentTextIdx = 0
    }

    public previous(): SongContext | null {
        if(this._currentSongId === null || this._currentTextIdx === null || this.isEmpty()) return null
        
        this._currentTextIdx--;

        if(this._currentTextIdx < 0 ) { // 이전 가사가 없으면 이전 노래 마지막 가사로 이동
            const currentSongIdx = this._order.indexOf(this._currentSongId)

            if(currentSongIdx <= 0) { // 현재 노래를 찾을수 없거나(indexOf: -1) 첫번째 노래였다면(indexOf: 0)
                this._currentTextIdx = 0 // 원상복구
                return null
            }

            const songId = this._order[currentSongIdx -1] // 이전 노래 id

            this._currentSongId = songId
            this._currentTextIdx = this._songs[songId].texts.length - 1
        }

        return this.currentContext
    }

    public next(): SongContext | null {

        if(this._currentSongId === null || this._currentTextIdx === null || this.isEmpty()) return null
        
        const song = this._songs[this._currentSongId]

        this._currentTextIdx++;

        if(this._currentTextIdx >= song.texts.length) { // 다음 가사가 없으면 다음 노래 첫번째 가사로 이동
            const currentSongIdx = this._order.indexOf(this._currentSongId) // 현재 노래 인덱스

            if(currentSongIdx === -1 || currentSongIdx >= this._order.length - 1) { // 현재 노래가 없거나 마지막 노래였으면
                this._currentTextIdx = song.texts.length -1 // 원상복구
                return null
            }

            this._currentSongId = this._order[currentSongIdx + 1]
            this._currentTextIdx = 0
        }


        return this.currentContext
    }
    
    public goto(id: number, textIdx: number): void {
        const song = this._songs[id]
        if(!song || textIdx < 0 || textIdx >= song.texts.length) return

        this._currentSongId = id
        this._currentTextIdx = textIdx
    }

    public resortOrder (ids: readonly number[]): void {
    
        const nts = new Set(ids)

        this._order.forEach(t => {
            if(!nts.has(t)) {
                delete this._songs[t]
            }
        })

        this._order = [...ids]

        if(this._currentSongId !== null && !nts.has(this._currentSongId)) {
            this._currentSongId = this._order[0] ?? null
            this._currentTextIdx = (this._currentSongId !== null) ? 0 : null 
        }

    }

    public async loadFiles(files: readonly File[]): Promise<void> {
        
        if (!files || files.length === 0) return
            
        for(const file of files) {
            if(file.type.includes('json')) {

                const parsed = JSON.parse(await file.text())

                if(Array.isArray(parsed)) this.loadJson(file.name, parsed)
                else this.loadJson(file.name, [parsed])

            }
            else if (file.type.startsWith('image/')) this.loadImage(file)
        }

    }

    private loadImage(file: File): void {
        if(file.name in this._imgUrls) URL.revokeObjectURL(this._imgUrls[file.name].url)

        this._imgUrls[file.name] = {file: file, url: URL.createObjectURL(file)}
    }

    private loadJson(fileName: string, songInfos: SongInfoOnJSON[]): void {
        const songDatas: SongData[] = []

        songInfos.forEach(songInfo => {
            
            const idAdded = {...convertJSONtoSongInfo(songInfo), id: this.nextId}

            this.addSong(idAdded)
            songDatas.push(idAdded)
        })
        this._jsonFiles[fileName] = songDatas
    }

    private removeImg(imgName: string): void {
        URL.revokeObjectURL(this._imgUrls[imgName]?.url)
        delete this._imgUrls[imgName]
    }

    private addSong(song: SongData): void {
        if(!this._songs[song.id]) this._order.push(song.id)
        this._songs[song.id] = {...song}
    }

    private insertNewSongAt(index: number, select: boolean = true): void {
        const id = this.nextId

        this._order = this._order.toSpliced(index, 0, id)
        this._songs[id] = {...this._defaultSongInfo}

        if(select){
            this._currentSongId = id
            this._currentTextIdx = 0
        }
    }

    public insertNewSongBeforeCurrent(): void {
        if(this._currentSongId === null) return
        const idx = this._order.indexOf(this._currentSongId)
        if(idx !== null) this.insertNewSongAt(idx, true)
    }

    public insertNewSongAfterCurrent(): void {
        if(this._currentSongId === null) return
        const idx = this._order.indexOf(this._currentSongId)
        if(idx !== null) this.insertNewSongAt(idx + 1, true)
    }

    private insertNewTextAt(songId: number, textIndex: number, select: boolean = true): void {
        const song = this._songs[songId]

        if(!song) return

        if(textIndex < 0) textIndex = 0
        else if(textIndex >= song.texts.length) textIndex = song.texts.length

        this._songs[songId] = {...song, texts: song.texts.toSpliced(textIndex, 0, {"title": song.title, "text": "가사를 입력하세요"})}

        if(select) this._currentTextIdx = textIndex
    }

    public insertNewTextBeforeCurrent(): void {
        if(this._currentSongId !== null && this._currentTextIdx !== null)
            this.insertNewTextAt(this._currentSongId, this._currentTextIdx)
    }

    public insertNewTextAfterCurrent(): void {
        if(this._currentSongId !== null && this._currentTextIdx !== null)
            this.insertNewTextAt(this._currentSongId, this._currentTextIdx + 1)
    }

    public initSong(): void {
        this._currentSongId = null
        this._currentTextIdx = null
        this._songs = {}
        this._order = []
    }

    private deleteSong(id: number, select: boolean = true): void {
        const index = this._order.indexOf(id)
        console.log(index)
        if(index == -1) return

        delete this._songs[id]
        this._order = this._order.filter(v => v != id)

        if(select) {
            this._currentSongId = this._order[index] ?? this._order[index -1] ?? null
            if(this._currentSongId === null) this._currentTextIdx = null
        }
    }

    public deleteCurrentSong(): void {
        if(this._currentSongId !== null) this.deleteSong(this._currentSongId)
    }

    private deleteText(songId: number, textIndex: number, select: boolean = true): void {
        const song = this._songs[songId]

        if(!song) return
        if(textIndex < 0 || textIndex >= song.texts.length) return

        if(song.texts.length <= 1) { // 길이가 1이면 그냥 노래 삭제
            this.deleteSong(songId, select)
            return
        }

        const newTexts = song.texts.toSpliced(textIndex, 1)

        this._songs[songId] = {...song, texts: newTexts}

        if(select) this._currentTextIdx = (textIndex >= newTexts.length) ? newTexts.length -1 : textIndex
    }

    public deleteCurrentText(): void {
        if(this._currentSongId && this._currentTextIdx !== null) this.deleteText(this._currentSongId, this._currentTextIdx)
    }

    public modifySong(modified: ModifiedSongData): void {
        const original = this._songs[modified.id]
        if(!original) return

        this._songs[modified.id] = {
            ...original,
            ...modified,
            texts: [...modified.texts]
        }
    }

    public manageFile(managementResult: ManagementResult): void {

        managementResult.removedImgs.forEach(imgName => {this.removeImg(imgName)}) // 이미지 삭제

        Object.entries(managementResult.removedJsons).forEach(([fileName, option]) => {
            const json = this._jsonFiles[fileName]
            if(!json) return
            
            if(option == "CASCADE") json.forEach(songData => this.deleteSong(songData.id, false)) // CASCADE 옵션으로 삭제 시 파일 내 모든 곡들도 삭제함.

            delete this._jsonFiles[fileName]
        })

        managementResult.refreshedJsons.forEach(fileName => {
            const json = this._jsonFiles[fileName]
            if(!json) return
            json.forEach(songData => {
                this.deleteSong(songData.id, false)
                this.addSong(songData)
            }) // 파일 새로고침 시 파일 내 노래 모두 삭제 후 다시 추가함.
        })
    }

    public async getExportSongLink(exportedId: number): Promise<string> {
        const song = this._songs[exportedId]

        const {id, ...exportedSong} = song as SongData

        const zip = new JSZip()
    
        const jsonString = JSON.stringify(exportedSong, null, 2)
        zip.file(`${song.title}.json`, jsonString)

        const img = this._imgUrls[song.background]
        if(img) zip.file(song.background, img.file)
        
        const zipBlob = await zip.generateAsync({type: 'blob'})
        return URL.createObjectURL(zipBlob)
    }

    public async getExportAllLink(): Promise<string> {
        const exportList: SongInfo[] = []
        const usedImgs = new Set<string>()
        
        this._order.forEach(targetId => {
            const song = this._songs[targetId]

            const {id, ...exportedSong} = song as SongData
            
            exportList.push(exportedSong)
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