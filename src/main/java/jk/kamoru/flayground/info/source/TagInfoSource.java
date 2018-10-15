package jk.kamoru.flayground.info.source;

import java.io.File;
import java.util.List;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Repository;

import com.fasterxml.jackson.core.type.TypeReference;

import jk.kamoru.flayground.Flayground;
import jk.kamoru.flayground.info.domain.Tag;

@Repository
public class TagInfoSource extends InfoSourceJsonAdapter<Tag, Integer> {

	@Value("${path.info}") String infoPath;

	@Override
	File getInfoFile() {
		return new File(infoPath, Flayground.InfoFilename.TAG);
	}

	@Override
	TypeReference<List<Tag>> getTypeReference() {
		return new TypeReference<List<Tag>>() {};
	}

	@Override
	Tag newInstance(Integer key) {
		return new Tag(key);
	}

}
